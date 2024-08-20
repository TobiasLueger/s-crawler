import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [data, setData] = useState({});
  const [components, setComponents] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  const [showScreen, setShowScreen] = useState(1);

  useEffect(() => {
    fetch('/result.json')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    fetch('/components.json')
      .then(response => response.json())
      .then(data => setComponents(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  console.log(components.components);

  const filteredData = Object.entries(data).filter(([url, tags]) => {
    return tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) || url.toLowerCase().includes(searchTerm.toLowerCase())
  });

  const toggleTags = (url) => {
    setExpandedItems((prevExpandedItems) => ({
      ...prevExpandedItems,
      [url]: !prevExpandedItems[url],
    }));
  };

  // Check which components are not used on any page
  const findUnusedComponents = () => {
    const usedTags = new Set();
    
    // Collect all used tags from data
    Object.values(data).forEach(tags => {
      tags.forEach(tag => usedTags.add(tag));
    });

    // Filter out unused components
    const unusedComponents = components.components?.filter(component => !usedTags.has(component));

    return unusedComponents || [];
  };

  const unusedComponents = findUnusedComponents();

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => setShowScreen(1)}>Verbaute Module</button>
        <button onClick={() => setShowScreen(2)}>Ungenutzte Module</button>
      </header>
      {showScreen === 1 ?
        <>
          <h1>Sparkassen Seiten</h1>
          <input
            type="text"
            className="filter-input"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <p>Ergebnisse: {filteredData.length} </p>
          <div className="pages-list">
            {filteredData.map(([url, tags]) => {
              const isExpanded = expandedItems[url];

              return (
                <div className="page-item" key={url}>
                  <img src={`logo.png`} alt="Placeholder" />
                  
                  <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                  <p className="page-header">Funktionale Komponenten:</p>
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
        </>
      :
        <>
          <h1>Ungenutze Komponenten</h1>
          <div className="unused-components">
            {unusedComponents.length > 0 ? (
              <div>
                {unusedComponents.map(component => (
                  <p key={component}>{component}</p>
                ))}
              </div>
            ) : (
              <p>Es werden im Moment alle Komponenten verwendet!</p>
            )}
          </div>
        </>
      }
    </div>
  );
};

export default App;