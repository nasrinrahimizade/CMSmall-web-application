import 'bootstrap-icons/font/bootstrap-icons.css';
import { Row, Col, Table, Button, Image } from 'react-bootstrap';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Blocks(props) {
  return (
    <>
      <Row>
        <Col as="h2">Blocks ({props.blockswithimage.length}):</Col>
      </Row>
      <Row>
        <Col lg={10} className="mx-auto">
          <BlockTable blocks={props.blockswithimage} ></BlockTable>
        </Col> 
      </Row>
    </>
  );
}

function BlockTable(props) {
  

  const sortedBWI = [...props.blocks];
  sortedBWI.sort((a, b) => a.block.order - b.block.order);

    return (
        <>
          <Row>
            <Col>
             
            </Col>
          </Row>
          <Row>
            <dl>
              {
                sortedBWI.map((bwi) => <BlockRow block={bwi.block} image={bwi.image} key={bwi.block.id} />)
              }
            </dl>
          </Row>
        </>
      );
    }
    
    function BlockRow(props) {
      const { block, image } = props;
    
      return (
        <>
          <dt></dt>
          {block.type === 'image' ? (
            <dd>
              {image && <Image src={image.imageUrl} thumbnail />}
            </dd>
          ) : (
            <dd>{block.context}</dd>
          )}
        </>
      );
    }



// bar asas type bayad chiz haye motafavet neshan dahad



export default Blocks;