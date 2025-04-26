import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Alert } from 'react-bootstrap';
import {Page, Block} from './PBModels';
import SinglePage from './components/SinglePageComponent';
import WebsiteNameForm from './components/EditNameForm';
import NavHeader from './components/NavbarComponents';
import NotFound from './components/NotFoundComponent';
import PageForm from './components/PageForm';
import BlocksForm from './components/BlocksForm';
import PagesList from './components/PageListComponent';
import { LoginForm } from './components/AuthComponents';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import API from './API';

function App() {
  const [pages, setPages] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [pageDeleted, setPagedeleted] = useState(false);
  const [pageAdded, setPageAdded] = useState(false);
  const [pageEdited, setPageEdited] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [websiteName, setWebsiteName] = useState([]);

  //const navigate = useNavigate();

  useEffect(()=> {
    // get all the pages from API
    const getPages = async () => {
      const pages = await API.getPages();
      setPages(pages);
    }
    getPages();
  }, []);

  useEffect(()=> {
    // get website name from API
    const getName = async () => {
      const name = await API.getWebsiteName();
      setWebsiteName(name);
    }
    getName();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const userinformations = await API.getUserInfo(); // we have the user info here
      setUser(userinformations);
      setIsAdmin(userinformations.isAdmin);
      setLoggedIn(true);
    };
    checkAuth();
  }, []);


  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({msg: `Welcome, ${user.name}!`, type: 'success'});
      setIsAdmin(user.isAdmin);
    }catch(err) {
      setMessage({msg: err, type: 'danger'});
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setMessage('');
  };


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await API.getUsers();
        setUsers(users);
        
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
  
    fetchUsers();
  }, []);
  
  const deletePage = (pageId) => {
    API.deletePage(pageId)
      .then(() => {
        // Update the pages state after successful deletion
        setMessage({msg: `page deleted`, type: 'success'});
        const getPages = async () => {
          const pages = await API.getPages();
          setPages(pages);
          
        }
        getPages();
        
      })
      .catch((error) => {
        setMessage({msg: 'Could not delete ', type: 'danger'});
        console.log('Error deleting page:', error);
      });
  }

const modify = (newBlock, pageId) => {
  API.addBlock(newBlock, pageId)
    .then(() => {
      //Navigate(`/`);
      console.log('Block added successfully');
      const getPages = async () => {
        const pages = await API.getPages();
        setPages(pages);
      }
      getPages();
    })
    .catch((error) => {
      console.log('Error adding block:', error);
    });
}

const addPage = (page) => {
  API.addPage(page)
    .then((id) => {
      console.log('New page ID:', id); // Print the ID in the console
      const getPages = async () => {
        const pages = await API.getPages();
        setPages(pages);
      }
      getPages();
      setPageAdded(true);
     // return id;
    })
    .catch((error) => {
      // Handle the validation errors here
      console.log('Validation errors:', error);
    });
}

const updatePage = (page, id) => {
  
  API.updatePage(page, id)
  .then(() => {//navigate('/');
    //console.log('it should do this');
    const getPages = async () => {
    const pages = await API.getPages();
    setPages(pages);
       }
    getPages();
    setPageEdited(true);
    
  })
  .catch((error) => {
    // Handle the validation errors here
    console.log('Validation errors:', error);
  });
  
}

const updateName = (name) => {
  API.updateWebsiteName(name)
  .then(() => {//navigate('/');
    console.log('it should do update name');
    const getName = async () => {
    const webName = await API.getWebsiteName();
    setWebsiteName(webName);
    }
    getName();   
  })
  .catch((error) => {
    // Handle the validation errors here
    console.log('Validation errors:', error);
  });
}

return (
    <BrowserRouter>
        <Routes>
          <Route element={
            <>
              <NavHeader websiteName={websiteName} isAdmin={isAdmin} loggedIn={loggedIn} handleLogout={handleLogout}/>
              <Container fluid className="mt-3">
                {message && <Row>
                  <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
                </Row> }
                <Outlet/>
              </Container>
            </>} >
            <Route index
              element={ <PagesList pages={pages} loggedIn={loggedIn} setPagedeleted={false} /> } />
            <Route path='pages/:pageId' 
              element={
              //pageDeleted ? <Navigate replace to='/' setPagedeleted={false} pages={pages}/> :
              <SinglePage pages={pages} loggedIn={loggedIn} deletePage={deletePage} user={user} isAdmin={isAdmin} setPagedeleted={setPagedeleted}/>               
              } />
             <Route path='addPage' 
               element={<PageForm addPage={addPage} pages={pages} lastId={Math.max(...pages.map(p => p.id))} isAdmin={isAdmin} setPageAdded={setPageAdded} edit={false} users={users}/>} />

             <Route path='pages/:pageId/editpage' 
              element={<PageForm updatePage={updatePage}  edit={true} setPageAdded={setPageAdded} isAdmin={isAdmin} setPageEdited={setPageEdited} users={users}/>} />

              <Route path='/pages/:pageId/editblocks' element={<BlocksForm edit={true} modify={modify} />} />
              <Route path='addPage/:pageId/addblocks' element={<BlocksForm edit={false} modify={modify} />} />
              <Route path='/edit-website-name' element={ < WebsiteNameForm websiteName={websiteName} updateName={updateName}/> } />
             <Route path='*' element={ <NotFound/> } />
            <Route path='/login' element={
              loggedIn ? <Navigate replace to='/' /> : <LoginForm login={handleLogin} />
            } />
          </Route>
        </Routes>
    </BrowserRouter>
  )
}

export default App;
