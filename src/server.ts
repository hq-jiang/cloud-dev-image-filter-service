import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());


  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  app.get("/filter", processImage);

  async function processImage(req : express.Request, res : express.Response) {
    const imageUrl : string = req.query.image_url;
    if (imageUrl.startsWith("https://") || imageUrl.startsWith("http://")) {
      filterImageFromURL(imageUrl)
      .then((localImagePath) => {
        res.sendFile(localImagePath);
        res.on('finish', function(){
          deleteLocalFiles([localImagePath]);
        })
      })
      .catch((error) =>{
        res.status(404).send(`${error}`);
      });
    } else {
      res.status(400).send(`Not a valid address: ${imageUrl} `);
    }


  }

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
})();