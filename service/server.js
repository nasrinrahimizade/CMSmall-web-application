'use strict';

// imports
const express = require('express');
const morgan = require('morgan');
const dao = require('./dao');
const {check, validationResult} = require('express-validator');
const cors = require('cors');
const userDao = require('./user-dao');

// Passport-related imports
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');


// init
const app = express();
const port = 3001;

// set up middlewares
app.use(express.json());
app.use(morgan('dev'));

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  optionsSuccessStatus: 200,
  credentials: true
}
app.use(cors(corsOptions));

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};


// Passport: set up local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await userDao.getUser(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + email + name
  return cb(null, user);
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));



/* ROUTES*/
// GET /api/users
app.get('/api/users', async(req, res) => {
    userDao.getUsers()
    .then(users => res.json(users))
    .catch (()=> res.status(500).end());
    
  
});

app.get('/api/pagename', async (req, res) => {
  try {
    const name = await dao.getPageName();
    res.json(name);
  } catch (err) {
    res.status(500).end();
  }
});



app.put('/api/pagename', isLoggedIn, [
  check('name').notEmpty()
], async (req, res) => {
  console.log('doing update name');
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array().join(", ") });
  }

  const newName = req.body.name; // Access the name property from req.body
  try {
    const result = await dao.updateName(newName);
    if (result.error) {
      res.status(404).json(result);
    } else {
      res.json(result);
    }
  } catch (err) {
    res.status(503).json({ error: `Database error during the update of website name ${err}` });
  }
});




// GET /api/pages
app.get('/api/pages', (request, response) => {
    dao.listPages()
    .then(pages => response.json(pages))
    .catch(() => response.status(500).end());
  });
  
// GET /api/pages/<id>
app.get('/api/pages/:id', async(req, res) => {
  try {
    const page = await dao.getPage(req.params.id);
    res.json(page);
  } catch {
    res.status(500).end();
  }
});

// GET /api/pages/<id>/blocks
app.get('/api/pages/:id/blocks', async (req, res) => {
  try {
    const blocks = await dao.listBlocksOf(req.params.id);
    
    const blockPromises = blocks.map(async (block) => {
      if (block.type === 'image') {
        const image = await dao.getImage(block.imageId);
        return { block, image };
      } else {
        return { block, image: null };
      }
    });
    
    const results = await Promise.all(blockPromises);
    
    const response = results.map(({ block, image }) => {
      return {
        block: block.serialize(),
        image
      };
    });
    
    res.json(response);
  } catch {
    res.status(500).end();
  }
});

//  Delete an existing page, given its “id”
// DELETE /api/pages/<id>
// Given a page id, this route deletes the associated page from the DB.
app.delete('/api/pages/:id',
  isLoggedIn,
  [ check('id').isInt() ],
  async (req, res) => {
    try {
      // NOTE: if there is no page with the specified id, the delete operation is considered successful.
      const result = await dao.deletePage(req.user.id, req.params.id);
      if (result == null)
        return res.status(200).json({}); 
      else
        return res.status(404).json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}: ${err} ` });
    }
  }
);


//title, authorId, author, creationDate, publicationDate

//{SERVER_URL}/api/pages/addPage
// POST /api/pages/addPage
app.post('/api/pages/addPage',
 [
  check('title').notEmpty(),
  check('authorId').isNumeric(),
  check('author').notEmpty(),
  //check('creationDate').isDate({format: 'YYYY-MM-DD', strictMode: true}) 
], 
  async (req, res) => {
  // Is there any validation error?
  console.log(req.body);
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
  }

  //const newPage = req.body;
  const newPage = {
    title: req.body.title,
    authorId: req.body.authorId,
    author : req.body.author,
    creationDate: req.body.creationDate,
    publicationDate: req.body.publicationDate === 'Invalid Date' ? null : req.body.publicationDate
  };

  try {
    const result = await dao.addPage(newPage); 
    res.json(result);
  } catch (err) {
    res.status(503).json({ error: `Database error during the creation of new page: ${err}` }); 
  }
}
);

// PUT /api/pages/<id>/updatePage
app.put('/api/pages/:pageId/updatePage',isLoggedIn, [
  check('title').notEmpty(),
  check('authorId').isNumeric(),
  check('author').notEmpty(),
  //check('creationDate').isDate({format: 'YYYY-MM-DD', strictMode: true}) 
], async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);;
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array().join(", ") });
    }
  console.log(req.body);
  console.log(req.params.pageId);

  const pageToUpdate = req.body;
  const pageId = req.params.pageId;
  const page = {
    //id : req.body.id,
    title : req.body.title,
    authorId : req.body.authorId,
    author: req.body.author,
    creationDate : req.body.creationDate,
    publicationDate : req.body.publicationDate
  };

  try {
    const result = await dao.updatePage(pageToUpdate, pageId);
    if (result.error)
      res.status(404).json(result);
    else
      res.json(result); 
  } catch (err) {
    res.status(503).json({ error: `Database error during the update of page ${req.params.id}: ${err}` });
  }
}
);

//  Delete all the blocks of a page, given its “pageId”
// DELETE /api/pages/<id>/blocks
// Given a page id, this route deletes the associated blocks from the DB.
app.delete('/api/pages/:id/blocks',
  isLoggedIn,
  [ check('id').isInt() ],
  async (req, res) => {
    try {
      // NOTE: if there is no blocks with the specified id, the delete operation is considered successful.
      const result = await dao.deleteBlocks(req.params.id);///here
      if (result == null)
        return res.status(200).json({}); 
      else
        return res.status(404).json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error ` });
    }
  }
);

//{SERVER_URL}/api/pages/:pageId/blocks
// POST /api/pages/:id/blocks
app.post('/api/pages/:id/blocks',
 [
  check('type').notEmpty(),
  check('order').isNumeric()
], 
  async (req, res) => {
  // Is there any validation error?
  console.log(req.body);
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
  }

  //const newPage = req.body;
  const newBlock = {
    pageId : req.params.id,
    type : req.body.type,
    context : req.body.context,
    imageId : req.body.imageId,
    order : req.body.order
  };

  try {
    const result = await dao.addBlock(newBlock); 
    res.json(result);
  } catch (err) {
    res.status(503).json({ error: `Database error `}); 
  }
}
);

// GET /api/pages/<id>/blocksonly
app.get('/api/pages/:id/blocksonly', async (req, res) => {
  try {
    const blocks = await dao.listBlocksOf(req.params.id);
    res.json(blocks);
  } catch {
    res.status(500).end();
  }
});


// POST /api/sessions
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).send(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        return res.status(201).json(req.user);
      });
  })(req, res, next);
});


// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});
// start the server
app.listen(port, () => 'API server started');