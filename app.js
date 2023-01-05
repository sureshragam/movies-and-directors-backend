const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

// get /movies/ api
app.get("/movies/", async (request, response) => {
  try {
    const movieListQuery = `
        SELECT movie_name AS movieName
        FROM movie
        ORDER BY movie_id;
        `;
    const movieListArray = await db.all(movieListQuery);
    response.send(movieListArray);
  } catch (e) {
    console.log(e.message);
  }
});

// post /movies/

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  try {
    const movieAddQuery = `
            INSERT INTO 
                movie(director_id,movie_name,lead_actor)
            VALUES(
                ${directorId},
                '${movieName}',
                '${leadActor}'
            );
        `;
    await db.run(movieAddQuery);
    response.send("Movie Successfully Added");
  } catch (e) {
    console.log(e.message);
  }
});

const initializeServerAndConnectDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Starting server at http://localhost:3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeServerAndConnectDatabase();

// get /movies/:movieId/ api

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  try {
    const movieQuery = `
            SELECT movie_id AS movieId,
            director_id AS directorId,
            movie_name AS movieName,
            lead_actor AS leadActor
            FROM movie
            WHERE movie_id = ${movieId}
        `;
    const movieDetail = await db.get(movieQuery);
    console.log(movieDetail);
    response.send(movieDetail);
  } catch (e) {
    console.log(e.message);
  }
});

// put /movies/:movieId/

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  try {
    const updateQuery = `
        UPDATE movie
        SET
            director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE movie_id = ${movieId}
        `;
    await db.run(updateQuery);
    response.send("Movie Details Updated");
  } catch (e) {
    console.log(e.message);
  }
});

// delete /movies/:movieId/

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  try {
    const deleteQuery = `
            DELETE
            FROM movie
            WHERE movie_id = ${movieId}
        `;
    await db.run(deleteQuery);
    response.send("Movie Removed");
  } catch (e) {
    console.log(e.message);
  }
});

// get /directors/

app.get("/directors/", async (request, response) => {
  try {
    const directoryListQuery = `
        SELECT director_id AS directorId,
        director_name AS directorName
        FROM director;
        `;
    const directorsArray = await db.all(directoryListQuery);
    response.send(directorsArray);
  } catch (e) {
    console.log(e.message);
  }
});

// get /directors/:directorId/movies/

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const specificDirectorMoviesQuery = `
    SELECT movie_name AS movieName
    FROM movie
    WHERE director_id = ${directorId};
    `;
  const directorMoviesList = await db.all(specificDirectorMoviesQuery);
  response.send(directorMoviesList);
});

module.exports = app;
