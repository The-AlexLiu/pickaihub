import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Tool } from '@/lib/types';

interface UseToolSearchOptions {
  tools: Tool[];
  keys?: string[];
  threshold?: number;
}

export function useToolSearch({ 
  tools, 
  keys = ['name', 'description', 'tags', 'category_label'], 
  threshold = 0.4 
}: UseToolSearchOptions) {
  const [query, setQuery] = useState('');

  // Memoize the Fuse instance so it's not recreated on every render
  const fuse = useMemo(() => {
    return new Fuse(tools, {
      keys,
      threshold, // 0.0 = perfect match, 1.0 = match anything
      ignoreLocation: true, // Find matches anywhere in the string
      includeScore: true,
      shouldSort: true,
    });
  }, [tools, keys, threshold]);

  // Memoize search results
  const results = useMemo(() => {
    if (!query) return tools;
    
    return fuse.search(query).map(result => result.item);
  }, [fuse, query, tools]);

  return {
    query,
    setQuery,
    results,
    hasActiveSearch: !!query
  };
}