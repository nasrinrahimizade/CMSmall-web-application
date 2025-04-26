/* Data Access Object (DAO) module */
const sqlite = require('sqlite3');
const { Block, Page ,MyImage } = require('./PBModels');




// open the database
const db_CMSmall = new sqlite.Database('exam1DB.sqlite', (err) => {
    if (err) throw err;
  });




exports.getPageName = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT webname FROM website WHERE id=1';
    db_CMSmall.get(sql, [], (err, row) => {
      if (err) {
        reject(err);
      }
      const websitename = row ? row.webname : null;
      resolve(websitename);
    });
  });
};
exports.updateName = (name) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE website SET webname = ? WHERE id=1';
    db_CMSmall.run(sql, [name], function(err) {
      if (err) {
        console.log(err);
        reject(err);
      } else if (this.changes !== 1) {
        resolve({ error: 'No name was updated' });
      } else {
        resolve({ message: 'Website name updated successfully' });
      }
    });
  });
};

  /** PAGES **/
// get all the pages
exports.listPages = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM pages';
      db_CMSmall.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        }
        const pages = rows.map((p) => new Page(p.id, p.title, p.authorId, p.author, p.creationDate, p.publicationDate));
        resolve(pages);
      });
    });
  }


  // get a page given its id
exports.getPage = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM pages WHERE id = ?';
      db_CMSmall.get(sql, [id], (err, row) => {
        if (err)
          reject(err);
        if (row == undefined)
          resolve({error: 'the Page not found.'}); 
        else {
          const page = new Page(row.id, row.title, row.authorId, row.author, row.creationDate, row.publicationDate);
          resolve(page);
        }
      });
    });
  };

// add a new page
exports.addPage = (page) => {
  return new Promise ((resolve, reject) => {
    const sql = 'INSERT INTO pages(title, authorId, author,creationDate, publicationDate) VALUES (?, ?, ?, DATE(?), ?)';
    db_CMSmall.run(sql, [page.title, page.authorId, page.author, page.creationDate, page.publicationDate], function(err) {
      if(err) reject(err);
      else resolve(this.lastID);
    });
  });
};
  
  /** BLOCKS **/

  // get all the blocks of a given page
  exports.listBlocksOf = (pageId) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM blocks WHERE pageId = ?';
      db_CMSmall.all(sql, [pageId], (err, rows) => {
        if (err) {
          reject(err);
        }
        const blocks = rows.map((b) => new Block(b.id, b.pageId , b.type, b.context, b.imageId, b.order));
        resolve(blocks);
      });
    });
  };
  
 
 
  
// Get image information by ID
exports.getImage = (imageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM images WHERE id = ?';
    db_CMSmall.get(sql, [imageId], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Image not found.' });
      } else {
        const image = new MyImage(row.id, row.name, row.imageUrl);
        resolve(image);
      }
    });
  });
};

// This function deletes an existing page given its id.
exports.deletePage = (user, id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM pages WHERE id=? ';
    db_CMSmall.run(sql, [id], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes !== 1)
        resolve({ error: 'No page deleted.' });
      else
        resolve(null);
    });
  });
}



// update an existing page
exports.updatePage = (page, pageId) => {
  return new Promise ((resolve, reject) => {
    const sql = 'UPDATE pages SET title=?, authorId=?, author=?,  creationDate=DATE(?), publicationDate=DATE(?) WHERE id=?';
    db_CMSmall.run(sql, [page.title, page.authorId, page.author, page.creationDate, page.publicationDate , pageId], function(err) {
      if(err) {
        console.log(err);
        reject(err);
      }
      if(this.changes !==1){
        resolve({error : 'NO page was updated'});
      }
      else {
        resolve(exports.getPage(pageId));
      }
      });
  });
};


exports.deleteBlocks = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM blocks WHERE pageId=?';
    db_CMSmall.run(sql, [id], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes >= 0) {
        resolve(null);
      } else {
        resolve({ error: 'No block deleted.' });
      }
    });
  });
};


// add a new block
exports.addBlock = (block) => {
  return new Promise ((resolve, reject) => {
    const sql = 'INSERT INTO blocks (pageId, type, context, imageId, `order`) VALUES (?, ?, ?, ?, ?)';
    db_CMSmall.run(sql, [ block.pageId , block.type, block.context, block.imageId, block.order], function(err) {
      if (err) {
        reject(err);
      } 
      else {
        resolve({ lastID: this.lastID });
      }
    });
  });
};
// get all the blocks of a given page
exports.listBlocksOf = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM blocks WHERE pageId = ?';
    db_CMSmall.all(sql, [pageId], (err, rows) => {
      if (err) {
        reject(err);
      }
      const blocks = rows.map((b) => new Block(b.id, b.pageId, b.type,b.context, b.imageId, b.order));
      resolve(blocks);
    });
  });
};

