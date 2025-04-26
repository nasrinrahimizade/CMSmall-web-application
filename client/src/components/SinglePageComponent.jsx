import { Row, Col, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import Blocks from './BlockComponents';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../API';
import { Block, MyImage } from '../PBModels';


function SinglePage(props) {
  const params = useParams();
  const pageId = parseInt(params.pageId);
  const page = props.pages.find(page => page.id === pageId);
  const [blockswithimage, setBlocksWithImage] = useState([]);
  const [images, setImages] = useState(null); // Add images state
  const [editPage, setEditPage] = useState(false);
  const [user, setUser]= useState(props.user);
  const [isAdmin, setIsAdmin]=useState(props.isAdmin);
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);
  const [message, setMessage] = useState('');
  const [pages, setPages] = useState([]);
  //const [page, setPage] = useState([]);

  /*useEffect(()=> {
    // get all the pages from API
    const getPages = async () => {
      const pages = await API.getPages();
      setPages(pages);
    }
    getPages();
    setPage ( pages.filter((p) => p.id === pageId))
  }, []);
*/
  useEffect(() => {
    const getBlocks = async () => {
      const blockswithimage = await API.getBlocks(params.pageId); // Update to get blocks and image
       setBlocksWithImage(blockswithimage);
      
    };
    getBlocks();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const userInformations = await API.getUserInfo();
      setUser(userInformations);
      setIsAdmin(userInformations?.isAdmin === 1);

      if (page && (page.authorId === userInformations?.id || isAdmin)) {
        setShowButton(true);
      }
    };

    checkAuth();
  }, [page, isAdmin]);
  
  const handleDelete = () => {
    props.deletePage(params.pageId);
    navigate('/');
  }
  return (
    <>
    {/* The check on "page" is needed to intercept errors due to invalid URLs (e.g., /pages/100 when you have 10 pages only) */}
    {page ? <>
      <PageDescription page={page} />
      {props.loggedIn && showButton &&( // Conditionally render the delete button
      <Button
        variant="danger"
        onClick={ () => handleDelete()}
        //disabled={page.authorId !== user.id}
      >
        <i className="bi bi-trash"></i>
      </Button>
      )}

      {props.loggedIn && showButton && (
        <Link to={`editPage`} className='btn btn-primary' state={page.serialize()}><i className='bi bi-pencil-square'></i></Link>
      )}
        
      <Blocks blockswithimage={blockswithimage}></Blocks>
      
      {props.loggedIn && showButton && (
        <Link to={`editblocks`} className='btn btn-primary' >Edit Blocks</Link>
      )}
      </> 
      :
      <p className='lead'>The selected page does not exist!</p>
    } 
    </>
  );
}

function PageDescription(props) {
  return (
    <>
      <Row>
        <PageHeader pageNum={props.page.id} author={props.page.author} />
      </Row>
      <Row>
        <PageText title={props.page.title} />
      </Row>
    </>
  );
}

function PageHeader(props) {
  return (
    <>
      <Col md={6} as="p">
        <strong>Page #{props.pageNum}:</strong>
      </Col>
      <Col md={6} as="p" className="text-end">
        Written by <span className="badge rounded-pill text-bg-secondary text-end">{props.author}</span>
      </Col>
    </>
  );
}

function PageText(props) {
  return (
    <Col as="p" className="lead">{props.title}</Col>
  );
}

export default SinglePage;