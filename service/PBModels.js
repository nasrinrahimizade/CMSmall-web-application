'use strict';

/* Same of week 09, but 1) with require() instead of import and 2) without any internal methods */

const dayjs = require('dayjs');

function Block(id, pageId , type, context, imageId, order) {
  this.id = id;
  this.pageId = pageId;
  this.type = type;
  this.context = context;
  this.imageId = imageId;
  this.order = order;

  /* Method to enable the proper serialization to string of the dayjs object. 
  Needed for the useLocation hook of react router when passing the block to the edit form (blockComponent and blockForm). */
  this.serialize = () => {
    return {id: this.id, pageId: this.pageId, type: this.type, context: this.context, imageId: this.imageId, order: this.order};
  }
}

function MyImage(id, name, imageUrl){
  this.id = id;
  this.name = name;
  this.imageUrl = imageUrl;
}

function Page(id, title, authorId, author, creationDate, publicationDate) {
  this.id = id;
  this.title = title;
  this.authorId = authorId;
  this.author = author;
  this.creationDate = dayjs(creationDate);
  this.publicationDate = publicationDate;
  
}

module.exports = { Block, Page , MyImage};