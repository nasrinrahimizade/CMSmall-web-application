import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Page } from '../PBModels';
import dayjs from 'dayjs';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../API';

function PageForm(props) {
  const params = useParams();
  let pageId = params.pageId;
  const navigate = useNavigate();
  const location = useLocation();
  const editablePage = location.state;

  const [user, setUser] = useState(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState(
    editablePage ? editablePage.authorId : ''
  );
  const [id, setId] = useState(editablePage ? pageId : props.lastId + 1);
  const [title, setTitle] = useState(editablePage ? editablePage.title : '');
  const [authorId, setAuthorId] = useState(
    editablePage ? editablePage.authorId : ''
  );
  const [author, setAuthor] = useState(
    editablePage ? editablePage.author : ''
  );
  const [creationDate, setCreationDate] = useState(
    editablePage ? editablePage.creationDate : dayjs().format('YYYY-MM-DD')
  );
  const [publicationDate, setPublicationDate] = useState(
    editablePage ? editablePage.publicationDate : dayjs().format('YYYY-MM-DD')
  );
  const [selectedAuthor, setSelectedAuthor] = useState(editablePage ? editablePage.author : '');
  const [isAdmin, setIsAdmin] = useState(props.isAdmin);
  const [users, setUsers]= useState(props.users);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await API.getUserInfo();
        setUser(userInfo);

        if (!editablePage) {
          setAuthorId(userInfo.id);
          setAuthor(userInfo.name);
        }
      } catch (error) {
        console.error('Failed to fetch user information:', error);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (props.isAdmin) {
      const selectedAuthor = users.find((user) => user.id === parseInt(selectedAuthorId));
      if (selectedAuthor) {
        setAuthor(selectedAuthor.name);
      }
    }
  }, [selectedAuthorId, users]);
 // console.log(users);
  const handleSubmit = (event) => {
    event.preventDefault();
    // create a new page
    
    const myAuthorId = isAdmin ? selectedAuthorId : authorId;
    //const myAuthor = isAdmin ? selectedAuthor : author;
    const newpage = new Page(
      id,
      title,
      myAuthorId,
      author,
      creationDate,
      publicationDate
    );

    // TODO: add validations!
    if (editablePage) {
      props.updatePage(newpage, id);
      navigate('..', { relative: 'path' });
    } else {
      
      
      API.addPage(newpage)
      .then((id) => {
        console.log('New page ID:', id); // Print the ID in the console
        navigate(`${id}/addblocks`);
        
      })
      .catch((error) => {
        // Handle the validation errors here
        console.log('Validation errors:', error);
      });


      
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className='mb-3'>
        <Form.Label>Title</Form.Label>
        <Form.Control
          type='text'
          minLength={2}
          required={true}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        ></Form.Control>
      </Form.Group>
      {props.isAdmin ? (
        <Form.Group className='mb-3'>
          <Form.Label>AuthorId</Form.Label>
          <Form.Select
            value={selectedAuthorId}
            onChange={(event) => setSelectedAuthorId(event.target.value)}
          >
            <option value=''>Select an author</option>
            {props.users &&
              props.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
          </Form.Select>
        </Form.Group>
      ) : (
        <>
          <Form.Group className='mb-3'>
            <Form.Label>AuthorId</Form.Label>
            <Form.Control
              type='number'
              disabled={true}
              required={true}
              value={authorId}
              onChange={(event) => setAuthorId(event.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Author name</Form.Label>
            <Form.Control
              type='text'
              disabled={true}
              minLength={2}
              required={true}
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
            ></Form.Control>
          </Form.Group>
        </>
      )}
      <Form.Group className='mb-3'>
        <Form.Label>Creation Date</Form.Label>
        <Form.Control
          type='date'
          disabled={true}
          value={creationDate}
          onChange={(event) => setCreationDate(event.target.value)}
        ></Form.Control>
      </Form.Group>
      <Form.Group className='mb-3'>
        <Form.Label>Publication Date</Form.Label>
        <Form.Control
          type='date'
          value={publicationDate}
          onChange={(event) => setPublicationDate(event.target.value)}
        ></Form.Control>
      </Form.Group>

      {props.edit ? (
        <>
          <Button variant='primary' type='submit'>
            Update
          </Button>{' '}
          <Link
            to='..'
            relative='path'
            className='btn btn-danger'
          >
            Cancel
          </Link>
        </>
      ) : (
        <>
          <Button variant='primary' type='submit'>
            Next
          </Button>{' '}
          <Link
            to='..'
            relative='path'
            className='btn btn-danger'
          >
            Cancel
          </Link>
        </>
      )}
    </Form>
  );
}

export default PageForm;