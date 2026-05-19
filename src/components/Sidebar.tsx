'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { tools } from '@/config/tools';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">BlankCraft</h1>
        <p className="text-xs text-gray-400 mt-1">Multi-Tool Document Editor</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {tools.map((tool) => {
          const isActive = pathname === tool.path;
          return (
            <Link
              key={tool.id}
              href={tool.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{tool.icon}</span>
              <div>
                <p className="text-sm font-medium">{tool.name}</p>
                <p className="text-xs text-gray-400">{tool.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">BlankCraft v1.0.0</p>
      </div>
    </aside>
  );
}
