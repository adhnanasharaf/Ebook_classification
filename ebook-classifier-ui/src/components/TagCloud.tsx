import React from 'react';

interface TagCloudProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

const TagCloud: React.FC<TagCloudProps> = ({ tags, selectedTag, onTagSelect }) => {
  return (
    <div className="tag-cloud">
      {tags.map(tag => (
        <button
          key={tag}
          className={`tag-button ${selectedTag === tag ? 'selected' : ''}`}
          onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagCloud;