import { useEffect, useRef, useState } from "react";

const KEY = "f50af60c";

//custom hook is a function not a comp, so not props lile {}
export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [error, setError] = useState("");
  //event handler is the preferred way to handle side effects
  useEffect(
    function () {
      //call handleCloseMovie only if it exists
    //   callback?.();
      //abort controller to cleanup fetch api calls
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setisLoading(true);
          //reset all errors before fetching data again
          setError("");
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          // handling errors - offline, no movies found with search query
          if (!res.ok)
            throw new Error("Something went wrong with fetching the movies!!");
          const data = await res.json();
          if (data.Response === "False")
            throw new Error(
              "Movie not found ! Try again with a different movie name"
            );
          setMovies(data.Search);
          setError("");
          //console.log(movies); //empty array because async state updation,
          console.log("Movies", data.Search);
        } catch (err) {
          console.log(err.message);
          setError(err.message);

          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          //whether or not there is an error set loading to false eventually
          setisLoading(false);
        }
      }
      if (!query.length) {
        setMovies([]);
        setError("");
        return; //dont call the fetchMovies function
      }

      //with new search close the currently displayed movie
      fetchMovies();

      //cleanup function
      return function () {
        controller.abort();
        //each keystroke new render - that fetch req is cancelled
      };
    },
    [query]
  ); //empty arr only once on mount

  return { movies, isLoading, error };
}
