import React, { useState, useEffect } from 'react';
import './App.css'


/*

Em 2 terminais diferentes:

Iniciar o server:          npm start
Iniciar o Banco de dados:  npx json-server db.json --port 3001 

*/

function App() {
  const [lists, setLists] = useState([]);
  const [newList, setNewList] = useState('');
  const [important, setImportant] = useState(false);
  const [showImportant, setShowImportant] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [SuccessMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/lists')
      .then(response => response.json())
      .then(data => setLists(data))
      .catch(error => console.error('Error:', error));
  }, []);

  const handleInputChange = (event) => {
    setNewList(event.target.value);
  };
  const handleImportantToggle = () => {
    setImportant(!important);
  };
  //adicionar anotação
  const handleListSubmit = (event) => {
    event.preventDefault();
    //mensagem de erro na lista
    if (newList.trim() === '') {
      setErrorMessage('ERRO: a caixa de texto não pode estar vazia');
      setShowError(true);
      return;
    }
    if (newList.trim() !== '') {
      fetch('http://localhost:3001/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newList, important }),
      })
        .then(response => response.json())
        .then(data => {
          setLists([...lists, data]);
          setNewList('');
          setImportant(false);
          //menssagem de sucesso na lista
          setSuccessMessage('Sua anotação foi adicionada com sucesso!');
          setShowSuccess(true);
        })
        .catch(error => console.error('Error:', error));
    }
  };
  //editar anotação
  const handleListUpdate = (id) => {
    if (editContent.trim() === '') {
      setErrorMessage('ERRO: a caixa de texto não pode estar vazia');
      setShowError(true);
      return;
    }
    fetch(`http://localhost:3001/lists/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: editContent, important }),
    })
      .then(response => response.json())
      .then(data => {
        const updatedLists = lists.map(list => {
          if (list.id === id) {
            return { ...list, content: editContent, important };
          }
          return list;
        });
        setLists(updatedLists);
        setEditContent('');
        setImportant(false);
        setEditMode(false);
        setSuccessMessage('Sua anotação foi atualizada com sucesso!');
        setShowSuccess(true);
      })
      .catch(error => console.error('Error:', error));
  };
  //editar anotação especifica
  const handleListEdit = (id, content) => {
    setEditContent(content);
    setEditingId(id);
    setEditMode(true);
  };
  //tempo de tela de sucesso
  useEffect(() => {
    if (showSuccess) {
      const timeout = setTimeout(() => {
        setSuccessMessage('');
        setShowSuccess(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [showSuccess]);
  //tempo da tela de erro
  useEffect(() => {
    if (showError) {
      const timeout = setTimeout(() => {
        setErrorMessage('');
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [showError]);
  //deletar algo da lista
  const handleListDelete = (id) => {
    fetch(`http://localhost:3001/lists/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        const updatedLists = lists.filter(list => list.id !== id);
        setLists(updatedLists);
      })
      .catch(error => console.error('Error:', error));
  };
  //filtrar importante
  const handleToggleImportant = () => {
    setShowImportant(!showImportant);
  };
  const filteredLists = showImportant
    ? lists.filter(list => list.important)
    : lists;


  return (
    <div id='all'>
      ____________________________________________________________________________
      <h1 className='titulo'>Lista de anotações</h1>
      <div className='div1'> <form onSubmit={handleListSubmit}>
        <input className='input'
          type="text"
          placeholder="Adicione algo"
          value={newList}
          onChange={handleInputChange}
        />
        <label className='checkbox'>
          <input
            type="checkbox"
            checked={important}
            onChange={handleImportantToggle}
          />
          Importante
        </label>
        <br></br>
        <button className='btnInserir' type="submit">Adicionar anotação</button>
      </form>
        <div className='form'>
          {showError && <p className="error">{errorMessage}</p>}
          {showSuccess && <p className="success">{SuccessMessage}</p>}
          ____________________________________________________________________________<br></br> <br></br> <br></br>
          <label className='filtrar'>
            <input
              type="checkbox"
              checked={showImportant}
              onChange={handleToggleImportant}
            />
            Filtrar anotações importantes
          </label>
        </div>
      </div>
      <ul className='lista'>
        {filteredLists.map((list) => (
          <li className='importante' key={list.id}>
            {editMode && list.id === editingId ? (
              <>
                <form onSubmit={() => handleListUpdate(list.id)}>
                  <input
                    type="text"
                    value={editContent}
                    onChange={(event) => setEditContent(event.target.value)}
                  />
                  <button type="submit">Salvar</button>
                </form>
                <button onClick={() => setEditMode(false)}>Cancelar</button>
              </>
            ) : (
              <>
                {list.content} {list.important && <strong>[Importante]</strong>}
                <button className='btnEdit' onClick={() => handleListEdit(list.id, list.content)}>E</button>
                <button className='btnClose' onClick={() => handleListDelete(list.id)}>X</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;