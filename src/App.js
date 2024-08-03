import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [data, setData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    fetch('/result.json')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const filteredData = Object.entries(data).filter(([url, tags]) => {
    return tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) || url.toLowerCase().includes(searchTerm.toLowerCase())
  });

  const toggleTags = (url) => {
    setExpandedItems((prevExpandedItems) => ({
      ...prevExpandedItems,
      [url]: !prevExpandedItems[url],
    }));
  };

  return (
    <div className="App">
      <h1>Sparkassen Komponenten</h1>
      <p>Suchfilter um Komponenten die per create Funktion verbaut sind zu finden</p>
      <input
        type="text"
        className="filter-input"
        placeholder="Komponenten Suche..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="pages-list">
        {filteredData.map(([url, tags]) => {
          const isExpanded = expandedItems[url];

          return (
            <div className="page-item" key={url}>
              <img src={`logo.png`} alt="Placeholder" />
              
              <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
              <p className="page-header">Komponenten:</p>
              <ul>
                  {tags.slice(0, isExpanded ? tags.length : 5).map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                {tags.length > 5 && (
                  <button onClick={() => toggleTags(url)}>
                    {isExpanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
                  </button>
                )}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default App;