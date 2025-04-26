import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Image, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../API';

function Block(type, context, imageId, order) {
  this.type = type;
  this.context = context;
  this.imageId = imageId;
  this.order = order;
}

function BlocksForm(props) {
  const params = useParams();
  let pageId = params.pageId;
  const navigate = useNavigate();
  const [blocksWithImage, setBlocksWithImage] = useState([]);
  const [numOfBlocks, setNumOfBlocks]=useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getBlocks = async () => {
      const blocksWithImage = await API.getBlocks(pageId); // Update to get blocks and image
      setBlocksWithImage(blocksWithImage);
    };
    getBlocks();
    setNumOfBlocks( blocksWithImage.length);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('handling the block form');
    // Add your form submission logic here
  
    const blocks = blocksWithImage.map((item) => item.block);
  
    const hasHeaderBlock = blocks.some((block) => block.type === 'header');
    const hasParagraphOrImageBlock = blocks.some((block) => block.type === 'paragraph' || block.type === 'image');
  
    if (hasHeaderBlock && hasParagraphOrImageBlock) {
      API.deleteBlocks(pageId)
        .then(() => {
          blocks.map((block) => {
            const newBlock = new Block(block.type, block.context, block.imageId, block.order);
            props.modify(newBlock, pageId);
            navigate(`/pages/${pageId}`)
          });
        })
        .catch((error) => {
          console.log('Error deleting blocks:', error);
        });
    } else {
      
      setMessage({msg: `You need to have a header and also another block with type image or paragraph`, type: 'danger'});
      
    }
  };
  
  const deletePage = (pageId) => {
    API.deletePage(pageId)
      .then(() => {
        // Update the pages state after successful deletion
        setMessage({msg: `page deleted`, type: 'success'});
        
      })
      .catch((error) => {
        setMessage({msg: 'Could not delete ', type: 'danger'});
        console.log('Error deleting page:', error);
      });
  }

  const handleCancel = () => {
    deletePage(params.pageId);
    navigate('..'); // Navigate back to the previous page
  };
  

  return (
    <Container>
      {message && <Row>
                  <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
                </Row> }
      <Row className="justify-content-center">
        <Col lg={10} className="mx-auto">
          <BlockTable blocks={blocksWithImage} setBlocksWithImage={setBlocksWithImage} pageId={pageId} numOfBlocks={numOfBlocks}/>
        </Col>
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            
            {/* Your form fields here */}
            {props.edit ? (
              <div className="text-center mt-3">
                <Button variant="primary" type="submit">
                  Update
                </Button>{' '}
                <Link to=".." relative="path" className="btn btn-danger">
                  Cancel
                </Link>
              </div>
            ) : (
              <div className="text-center mt-3">
                <Button variant="primary" type="submit">
                  Add
                </Button>{' '}
                <Link to="/" relative="path" className="btn btn-danger"  onClick={handleCancel}>
                  Cancel
                </Link>
              </div>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

function BlockTable(props) {
  const { blocks, setBlocksWithImage } = props;
  const [sortedBWI, setSortedBWI] = useState([...blocks]);
  const pageId = props.pageId;
  var counter = 0;
  const numOfBlocks = props.numOfBlocks;
  const [newBlock, setNewBlock] = useState({
    type: '',
    imageId: '',
    context: '',
    pageId : pageId,
    order : numOfBlocks + 1
  });

  useEffect(() => {
    setSortedBWI([...blocks]);
  }, [blocks]);

  sortedBWI.sort((a, b) => a.block.order - b.block.order);

  const handleNewBlock = () => {
    const updatedBlocks = [...sortedBWI, { block: { ...newBlock } }];
    setSortedBWI(updatedBlocks);
    setBlocksWithImage(updatedBlocks);
    setNewBlock({ type: '', imageId: '', context: '', order: updatedBlocks.length });
    //counter = counter +1;
  };
  const handleMoveUp = (index) => {
    if (index > 0) {
      const updatedBlocks = [...sortedBWI];
      [updatedBlocks[index], updatedBlocks[index - 1]] = [
        updatedBlocks[index - 1],
        updatedBlocks[index],
      ];
      setSortedBWI(updatedBlocks);
      setBlocksWithImage(updatedBlocks);
    }
  };

  const handleMoveDown = (index) => {
    if (index < sortedBWI.length - 1) {
      const updatedBlocks = [...sortedBWI];
      [updatedBlocks[index], updatedBlocks[index + 1]] = [
        updatedBlocks[index + 1],
        updatedBlocks[index],
      ];
      setSortedBWI(updatedBlocks);
      setBlocksWithImage(updatedBlocks);
    }
  };

  const handleDelete = (index) => {
    const updatedBlocks = sortedBWI.filter((_, i) => i !== index);
    setSortedBWI(updatedBlocks);
    setBlocksWithImage(updatedBlocks);
  };

  const handleChangeType = (index, value) => {
    const updatedBlocks = sortedBWI.map((bwi, i) => {
      if (i === index) {
        return {
          ...bwi,
          block: {
            ...bwi.block,
            type: value,
          },
        };
      }
      return bwi;
    });
    setBlocksWithImage(updatedBlocks);
    setSortedBWI(updatedBlocks);

    //console.log(sortedBWI); // Log blocksWithImage after type change
  };

  const handleChangeContext = (index, value) => {
    const updatedBlocks = sortedBWI.map((bwi, i) => {
      if (i === index) {
        return {
          ...bwi,
          block: {
            ...bwi.block,
            context: value,
          },
        };
      }
      return bwi;
    });
    setBlocksWithImage(updatedBlocks);
    setSortedBWI(updatedBlocks);

    //console.log(sortedBWI); // Log blocksWithImage after context change
  };

  const handleChangeImageField = (index, value) => {
    const updatedBlocks = sortedBWI.map((bwi, i) => {
      if (i === index) {
        return {
          ...bwi,
          block: {
            ...bwi.block,
            imageId: value,
          },
        };
      }
      return bwi;
    });
    setBlocksWithImage(updatedBlocks);
    setSortedBWI(updatedBlocks);

    //console.log(sortedBWI); // Log blocksWithImage after imageId change
  };

  return (
    <>
      <Row>
        <dl>
          {sortedBWI.map((bwi, index) => (
            <React.Fragment key={bwi.block.id}>
              <BlockNewForm
                block={bwi.block}
                index={index}
                handleChangeType={(index, value) => handleChangeType(index, value)}
                handleChangeContext={(index, value) => handleChangeContext(index, value)}
                handleChangeImageField={(index, value) => handleChangeImageField(index, value)}
                initialType={bwi.block.type}
              />
              <div className="mt-2">
                <Button
                  variant="secondary"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="me-2"
                >
                  <i className="bi bi-arrow-up-circle-fill"></i>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === sortedBWI.length - 1}
                  className="me-2"
                >
                  <i className="bi bi-arrow-down-circle-fill"></i>
                </Button>
                <Button variant="danger" onClick={() => handleDelete(index)}>
                  <i className="bi bi-trash-fill"></i>
                </Button>
              </div>
            </React.Fragment>
          ))}
        </dl>
      </Row>
      <div className="text-center mt-3">
              <Button variant="primary" onClick={handleNewBlock}>
                New Block
              </Button>
      </div>
    </>
  );
}

function BlockNewForm(props) {
  const { block, index, handleChangeType, handleChangeContext, handleChangeImageField } = props;
  const isImage = block.type === 'image'
  return (
    <div className="mt-3">
      <Form.Group>
        <Form.Label>Type</Form.Label>
        <Form.Control
          as="select"
          name={`type-${index}`}
          value={block.type}
          onChange={(e) => handleChangeType(index, e.target.value)}
        >
          <option value="">Select type</option>
          <option value="header">Type header</option>
          <option value="paragraph">Type paragraph</option>
          <option value="image">Type image</option>
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>Context</Form.Label>
        <Form.Control
          type="text"
          name={`context-${index}`}
          value={block.context}
          onChange={(e) => handleChangeContext(index, e.target.value)}
          disabled={isImage}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Image ID</Form.Label>
        <Form.Control
          as="select"
          type="number"
          name={`imageId-${index}`}
          value={block.imageId}
          onChange={(e) => handleChangeImageField(index, e.target.value)}
          disabled={!isImage}
        >
          <option value="">Select image</option>
          <option value="1">Dog</option>
          <option value="2">Cat</option>
          <option value="3">Flower 1</option>
          <option value="4">Flower 2</option>
          </Form.Control>
      </Form.Group>
    </div>
  );
}

export default BlocksForm;


