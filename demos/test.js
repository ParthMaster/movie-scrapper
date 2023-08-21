const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");

function fetchMovieDetails(url) {
  return axios
    .get(url)
    .then((response) => {
      const $ = cheerio.load(response.data);

      // Extract the movie details

      const movieTitle = $(".entry-title").text();
      const releaseDateText = $(".date-time time.published").text();
      const releaseDateValue = $(".date-time time.published")
        .eq(0)
        .attr("datetime");

      // Format the release date without timezone as "2023-05-03 15:40:27"
      const releaseDateWithoutTimezone = moment(releaseDateValue).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      const imdbRating = $('a[href^="https://www.imdb.com"]').text();
      const synopsis = $('h3:contains("Movie-SYNOPSIS/PLOT:")')
        .next("p")
        .text();

      // Extract the screenshots
      const screenshots = [];
      $("p img").each((index, element) => {
        const url = $(element).attr("src");
        screenshots.push({ url });
      });

      // Extract the starring information
      const starringText = $('p:contains("Starring")').text();
      const starringMatches = starringText.match(/Starring\s*:\s*(.+)/i);

      let starring = [];
      if (starringMatches) {
        starring = starringMatches[1].split(",").map((star) => star.trim());
      }

      // Extract additional details from the same URL
      const movieInfoText = $('h3:contains("Movie Info:")').next("p");

      const sizeMatch = movieInfoText.text().match(/Size:\s(.+?)\n/);
      const qualityMatch = movieInfoText.text().match(/Quality:\s(.+?)\n/);
      const formatMatch = movieInfoText
        .text()
        .match(/Format:\s([A-Za-z0-9-]+)/);
      const languageMatch = movieInfoText.text().match(/Language:\s(.+?)\n/);

      const size = sizeMatch ? sizeMatch[1] : "N/A";
      const quality = qualityMatch ? qualityMatch[1] : "N/A";
      const format = formatMatch ? formatMatch[1] : "N/A";
      const language = languageMatch ? languageMatch[1] : "N/A";

      const subtitleMatch = movieInfoText
        .html()
        .match(/<strong>Subtitle:<\/strong>\s(.+?)<br/);
      const movieNameMatch = movieInfoText
        .html()
        .match(/<strong>Movie Name:<\/strong>\s(.+?)<br/);
      const releaseYearMatch = movieInfoText
        .html()
        .match(/<strong>Release Year:<\/strong>\s(.+?)<br/);

      const subtitle = subtitleMatch ? subtitleMatch[1].trim() : "N/A";
      const movieName = movieNameMatch ? movieNameMatch[1].trim() : "N/A";
      const releaseYear = releaseYearMatch ? releaseYearMatch[1].trim() : "N/A";

      // Extract the feature image
      const featureImageRelativeUrl = $(".single-feature-image img").attr(
        "src"
      );
      const baseImageUrl = url.split("/").slice(0, 3).join("/");
      const featureImageUrl = baseImageUrl + featureImageRelativeUrl;

      // Extract additional fields
      const description1 = $(".entry-content p").eq(0).text();
      const description2 = $(".entry-content p").eq(1).text();
      const subheading = $(".entry-content h3").eq(0).text();

      // Create an object with the extracted information
      const movieDetails = {
        movie_title: movieTitle,
        feature_image: featureImageUrl,
        release_date_with_timezone: releaseDateValue,
        release_date_without_timezone: releaseDateWithoutTimezone,
        description1,
        description2,
        subheading,
        imdb_rating: imdbRating,
        movie_name: movieName,
        release_year: releaseYear,
        language,
        subtitle,
        size,
        quality,
        format,
        synopsis,
        starring,
        screenshots,
      };
      console.log(movieDetails);
      return movieDetails;
    })
    .catch((error) => {
      throw new Error("Error fetching movie details: " + error.message);
    });
}

fetchMovieDetails(
  "https://www.vegamovies.tv/download-cocaine-bear-2023-dual-audio-hindi-bluray-480p-720p-1080p-2160p/"
);



const feature_image = {
  image:'/wp-content/uploads/2023/04/Citadel-2023-posters-Priyanka-Chopra-poster.jpg',
  image_300w:'/wp-content/uploads/2023/04/Citadel-2023-posters-Priyanka-Chopra-poster.jpg',
  image_200w:'/wp-content/uploads/2023/04/Citadel-2023-posters-Priyanka-Chopra-poster-200x300.jpg',
  image_165w:'/wp-content/uploads/2023/04/Citadel-2023-posters-Priyanka-Chopra-poster-165x248.jpg'
}