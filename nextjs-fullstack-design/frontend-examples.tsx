// 现代化 React 组件示例：替代当前前端实现

// src/app/(dashboard)/chat/page.tsx - 聊天主页面
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatRoomList } from '@/components/chat/ChatRoomList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { CreateRoomModal } from '@/components/chat/CreateRoomModal';
import type { Room } from '@/lib/types';

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 - 聊天室列表 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">聊天室</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              新建
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">欢迎，{user.username}</p>
        </div>
        
        <ChatRoomList
          selectedRoom={selectedRoom}
          onRoomSelect={setSelectedRoom}
        />
      </div>

      {/* 主内容区 - 聊天窗口 */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <ChatWindow
            room={selectedRoom}
            currentUser={user}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p>选择一个聊天室开始对话</p>
            </div>
          </div>
        )}
      </div>

      {/* 创建房间弹窗 */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // 刷新房间列表会通过 React Query 自动处理
          }}
        />
      )}
    </div>
  );
}

// src/components/chat/ChatRoomList.tsx - 聊天室列表组件
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { Room } from '@/lib/types';

interface ChatRoomListProps {
  selectedRoom: Room | null;
  onRoomSelect: (room: Room) => void;
}

export function ChatRoomList({ selectedRoom, onRoomSelect }: ChatRoomListProps) {
  const [editingRoom, setEditingRoom] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const queryClient = useQueryClient();

  // 获取房间列表
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await fetch('/api/rooms');
      const result = await response.json();
      if (result.code === 0) {
        return result.data;
      }
      throw new Error(result.msg);
    },
    refetchInterval: 30000, // 30秒自动刷新
  });

  // 删除房间
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: number) => {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.code !== 0) {
        throw new Error(result.msg);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      // 如果删除的是当前选中的房间，清除选择
      if (selectedRoom && rooms.find(r => r.id === selectedRoom.id)) {
        onRoomSelect(null);
      }
    },
  });

  // 重命名房间
  const renameRoomMutation = useMutation({
    mutationFn: async ({ roomId, newName }: { roomId: number; newName: string }) => {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      const result = await response.json();
      if (result.code !== 0) {
        throw new Error(result.msg);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setEditingRoom(null);
      setNewName('');
    },
  });

  const handleRename = (roomId: number, currentName: string) => {
    setEditingRoom(roomId);
    setNewName(currentName);
  };

  const handleSaveRename = () => {
    if (editingRoom && newName.trim()) {
      renameRoomMutation.mutate({
        roomId: editingRoom,
        newName: newName.trim(),
      });
    }
  };

  const handleDelete = (roomId: number) => {
    if (confirm('确定要删除这个聊天室吗？')) {
      deleteRoomMutation.mutate(roomId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {rooms.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          还没有聊天室，创建一个吧！
        </div>
      ) : (
        <div className="space-y-1 p-2">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                selectedRoom?.id === room.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onRoomSelect(room)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {editingRoom === room.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border rounded"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename();
                          if (e.key === 'Escape') setEditingRoom(null);
                        }}
                        autoFocus
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveRename();
                        }}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                      >
                        保存
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-medium text-gray-900 truncate">
                        {room.name}
                      </h3>
                      {room.lastContent && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {room.lastSender}: {room.lastContent}
                        </p>
                      )}
                      {room.lastTime && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(room.lastTime), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {editingRoom !== room.id && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // 显示菜单逻辑
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {/* 简化版菜单 */}
                      <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg z-10 hidden group-hover:block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(room.id, room.name);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>重命名</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(room.id);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>删除</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// src/components/chat/ChatWindow.tsx - 聊天窗口组件
'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { MessageList } from './MessageList';
import type { Room, User, Message } from '@/lib/types';

interface ChatWindowProps {
  room: Room;
  currentUser: User;
}

export function ChatWindow({ room, currentUser }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(0);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  // 获取消息列表
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', room.id],
    queryFn: async () => {
      const response = await fetch(`/api/rooms/${room.id}/messages`);
      const result = await response.json();
      if (result.code === 0) {
        return result.data;
      }
      throw new Error(result.msg);
    },
    refetchInterval: 5000, // 5秒自动刷新
  });

  // 发送消息
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string; profile: number }) => {
      const response = await fetch(`/api/rooms/${room.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      const result = await response.json();
      if (result.code !== 0) {
        throw new Error(result.msg);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', room.id] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setMessage('');
      inputRef.current?.focus();
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate({
        content: message.trim(),
        profile: selectedProfile,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [room.id]);

  return (
    <div className="flex flex-col h-full">
      {/* 聊天室标题 */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold">{room.name}</h2>
        <p className="text-sm text-gray-500">{messages.length} 条消息</p>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} currentUser={currentUser} />
      </div>

      {/* 消息输入区 */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-2">
          {/* 头像选择 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium mb-2">
              {selectedProfile + 1}
            </div>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(Number(e.target.value))}
              className="text-xs border rounded px-1 py-0.5"
            >
              {[0, 1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  头像 {num + 1}
                </option>
              ))}
            </select>
          </div>

          {/* 输入框 */}
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sendMessageMutation.isPending}
            />
          </div>

          {/* 发送按钮 */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendMessageMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}