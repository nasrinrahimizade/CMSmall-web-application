//we will add all the APIs and Fetchs here
import { Page, Block , MyImage} from "./PBModels";
const SERVER_URL = 'http://localhost:3001';




function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

         // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
         response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj => 
              reject(obj)
              ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err => 
        reject({ error: "Cannot communicate"  })
      ) // connection error
  });
}


const getPages = async () => {
    const response = await fetch(SERVER_URL + '/api/pages');
    if(response.ok) {
      const pagesJson = await response.json();
      //console.log(pagesJson.title);
      return pagesJson.map(p => new Page(p.id, p.title, p.authorId, p.author, p.creationDate, p.publicationDate));
    }
    else
      throw new Error('Internal server error');
  };
  

  const getBlocks = async (pageId) => {
    const response = await fetch(SERVER_URL + `/api/pages/${pageId}/blocks`);
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw data.error;
    }
  };

/**
 * This function deletes a page from the back-end DB.
 */
function deletePage(pageId) {
  return getJson(
    fetch(SERVER_URL + `/api/pages/${pageId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
  )
}


const addPage = async (page) => {
  const response = await fetch(`${SERVER_URL}/api/pages/addPage`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({title: page.title , authorId: page.authorId, author: page.author , creationDate: page.creationDate.format('YYYY-MM-DD'), publicationDate : (page.publicationDate ? page.publicationDate.format('YYYY-MM-DD') : null)})
  });

  if (response.ok) {
    const id = await response.text(); // Get the ID from the response
    return id;
  } else if (response.status === 422) {
    const errors = await response.json();
    throw errors;
  } else {
    const errorMessage = await response.json();
    throw new Error(errorMessage);
  }
}

// PUT /api/pages/<id>/updatePage
const updatePage = async (page, pageId) => {
  
  return getJson( fetch(`${SERVER_URL}/api/pages/${pageId}/updatePage`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    credentials : 'include',
    body: JSON.stringify({title: page.title, authorId: page.authorId, author: page.author, creationDate: page.creationDate.format('YYYY-MM-DD'), publicationDate : (page.publicationDate ? page.publicationDate.format('YYYY-MM-DD') : null)})
  })
  )
}
function getUsers() {
  return fetch(SERVER_URL + `/api/users`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return response.json();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function getWebsiteName(){
  return fetch(SERVER_URL + '/api/pagename')
  .then((response)=>{
    if(!response.ok) {
      throw new Error('failed to fetch website name');
    }
    return response.json();
  })
  .catch((error) =>{
    console.error('Error:', error);
  });
}

const updateWebsiteName = async (name) => {
  try {
    const response = await fetch(SERVER_URL + '/api/pagename', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({name})
    });

    if (!response.ok) {
      throw new Error('Failed to update website name');
    }

    return response.json();
  } catch (error) {
    console.error('Error:', error);
  }
};

/**
 * This function deletes all blocks of a page from the back-end DB.
 */
// DELETE /api/pages/<id>/blocks
function deleteBlocks(pageId) {
  return getJson(
    fetch(SERVER_URL + `/api/pages/${pageId}/blocks`, {
      method: 'DELETE',
      credentials: 'include'
    })
  )
}

// POST /api/pages/:id/blocks
const addBlock = async (block, pageId) => {
  
  const response = await fetch(`${SERVER_URL}/api/pages/${pageId}/blocks`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({type: block.type , context: block.context, imageId: block.imageId ? block.imageId : 1 , order: block.order})
  });

  if (response.ok) {
    return null;
  } else if (response.status === 422) {
    const errors = await response.json();
    throw errors;
  } else {
    const errorMessage = await response.json();
    throw new Error(errorMessage);
  }
}

const getBlocksonly = async (pageId) => {
  const response = await fetch(SERVER_URL + `/api/pages/${pageId}/blocksonly`);
  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw data.error;
  }
};


const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
};

const logOut = async() => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}

const API = {getBlocksonly ,addBlock, deleteBlocks,updateWebsiteName , getWebsiteName, getUsers, updatePage ,addPage, getJson, getPages, getBlocks , deletePage , logIn, logOut, getUserInfo};
export default API;
