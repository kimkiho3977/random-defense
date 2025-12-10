import { useState, useEffect, useRef } from 'react';
import type { Tag } from '../types';
import { fetchTags } from '../api/solvedac';

interface Props {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagSelector({ selectedTags, onChange }: Props) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);  // 초기값 true
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    
    fetchTags()
      .then(data => {
        if (isMounted) {
          setTags(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTagName = (tag: Tag) => {
    const ko = tag.displayNames.find(d => d.language === 'ko');
    return ko?.name ?? tag.key;
  };

  const filteredTags = tags.filter(tag => {
    const koName = getTagName(tag).toLowerCase();
    const key = tag.key.toLowerCase();
    const s = search.toLowerCase();
    return (koName.includes(s) || key.includes(s)) && !selectedTags.includes(tag.key);
  });

  const addTag = (key: string) => {
    onChange([...selectedTags, key]);
    setSearch('');
    setIsOpen(false);
  };

  const removeTag = (key: string) => {
    onChange(selectedTags.filter(t => t !== key));
  };

  const getDisplayName = (key: string) => {
    const tag = tags.find(t => t.key === key);
    return tag ? getTagName(tag) : key;
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map(key => (
          <span
            key={key}
            className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {getDisplayName(key)}
            <button onClick={() => removeTag(key)} className="hover:text-blue-200">
              ✕
            </button>
          </span>
        ))}
      </div>
      
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={loading ? '태그 로딩 중...' : '태그 검색 (한글/영문)'}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {isOpen && filteredTags.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredTags.slice(0, 20).map(tag => (
            <li
              key={tag.key}
              onClick={() => addTag(tag.key)}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <span className="font-medium">{getTagName(tag)}</span>
              <span className="text-gray-400 text-sm ml-2">({tag.key})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}