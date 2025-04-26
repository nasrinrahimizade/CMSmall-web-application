import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../API';

function WebsiteNameForm(props) {

    const navigate = useNavigate();


    const [websiteName , setWebsiteName] = useState(props.websiteName);
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        await props.updateName(websiteName);
        navigate(-1);
      };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className='mb-3'>
        <Form.Label>New Name</Form.Label>
        <Form.Control
          type='text'
          minLength={2}
          required={true}
          value={websiteName}
          onChange={(event) => setWebsiteName(event.target.value)}
        ></Form.Control>
      </Form.Group>

      
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
      
    </Form>
  );
}

export default WebsiteNameForm;
