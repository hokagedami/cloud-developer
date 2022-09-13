require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL} from './util/util';
import {promises as fs} from 'fs';

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// endpoint to filter an image from a public url.
// IT SHOULD
//    1
//    1. validate the image_url query
//    2. call filterImageFromURL(image_url) to filter the image
//    3. send the resulting file in the response
//    4. deletes any files on the server on finish of the response
// QUERY PARAMETERS
//    image_url: URL of a publicly accessible image
// RETURNS
//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

app.get("/filteredimage", async (req, res) => {
  let image_url: string = req.query['image_url'].toString();

  if(!image_url || image_url.length === 0)
    return res.status(400).send({error: "\'image_url\' parameter is required"});

  const ext = image_url.split('.');
  if (ext.length < 2)
      return res.status(400).send({error: "Invalid file type. Image expected"})
  const validExt = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif']
  if (!validExt.includes(ext[ext.length-1]))
      return res.status(400).send({error: "Invalid file type. Image expected"})
  await filterImageFromURL(image_url)
      .then(async (path) => {
        fs.readFile(path)
            .then(async () => {
              res.sendFile(path);
            })
      });
})

/**************************************************************************** */

//! END @TODO1

// Root Endpoint
// Displays a simple message to the user
app.get( "/", async ( req, res ) => {
  res.send("try GET /filteredimage?image_url={{}}")
} );


// Start the Server
app.listen( port, () => {
  console.log( `server running http://localhost:${ port }` );
  console.log( `press CTRL+C to stop server` );
} );
