const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");

// Add the extractSlugFromURL function
const extractSlugFromURL = (url) => {
  const parts = url.split("/");
  return parts[parts.length - 2];
};

// Function to fetch HTML content from a URL
const fetchHTML = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching HTML: " + error.message);
  }
};

// Function to extract properties from the content
const getProperty = (content, ...names) => {
  for (const name of names) {
    const element = content.find(`p:contains("${name}:")`).first();
    if (element.length > 0) {
      const text = element.text();
      const match = text.match(new RegExp(`${name}:\\s*(.*)`, "i"));
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }
  return null;
};

// Function to scrape screenshots from the content
const scrapeScreenshots = (content, $) => {
  const screenshots = [];
  const screenshotHeadingsSelector = [
    "h2:contains('Screenshots: (Must See Before Downloading)…')",
    "h4:contains(': SCREENSHOTS :')",
    "h2:contains('Screenshots: (Must See Before Downloading)')",
  ].join(", ");

  const screenshotHeadings = content.find(screenshotHeadingsSelector);
  screenshotHeadings.each((_, heading) => {
    const screenshotContainer = $(heading).next("p");
    screenshotContainer.find("img").each((_, img) => {
      const url = $(img).attr("src");
      screenshots.push({ url });
    });
  });

  return screenshots;
};

const extractCreatorInfo = ($, content, variations) => {
  for (const variation of variations) {
    const creatorElement = content.find(`p:contains('${variation}')`).first();
    const creatorText = creatorElement
      .text()
      .match(new RegExp(`${variation}\\s*:\\s*(.*)`, "i"))?.[1]
      ?.trim();

    if (creatorText) {
      return creatorText;
    }
  }

  return null;
};

// Function to format URLs with root URL
const formatUrlWithRoot = (url, rootUrl) => {
  return url.startsWith(rootUrl) ? url : `${rootUrl}${url}`;
};

// Function to extract image URLs and format them with root URL
const extractAndFormatImageUrls = ($, imageElement, rootUrl) => {
  const imageSrc = imageElement.attr("src");
  const imageSrcSet = imageElement.attr("srcset");

  const imageUrls = {
    main: formatUrlWithRoot(imageSrc, rootUrl),
  };

  if (imageSrcSet) {
    const imageRegex = /([^ ]+)\s+(\d+w)/g;
    const imageMatches = [...imageSrcSet.matchAll(imageRegex)];

    for (const [, imageUrl, width] of imageMatches) {
      imageUrls[`size_${width}`] = formatUrlWithRoot(imageUrl, rootUrl);
    }
  }

  return imageUrls;
};

// Function to fetch movie details from a URL
const fetchMovieDetails = async (url) => {
  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const isSeason = /season/i.test(url) || /series/i.test(url);
    const slug = extractSlugFromURL(url);
    const title = $(".entry-title").text().trim();
    const content = $(".entry-content");

    const rootUrl = url.match(/^(https?:\/\/[^/]+)/)?.[1] || null;
    const featureImageElement = $(".single-feature-image img");
    const featureImage = extractAndFormatImageUrls(
      $,
      featureImageElement,
      rootUrl
    );

    const description1 = $(".entry-content p").eq(0).text();
    const description2 = $(".entry-content p").eq(1).text();
    const subheading = $(".entry-content h3").eq(0).text();

    const releaseDateElement = $(".date-time time.published");
    const releaseDateText = releaseDateElement.text();
    const releaseDateValue = releaseDateElement.attr("datetime");
    const releaseDate = moment(releaseDateValue).format("YYYY-MM-DD HH:mm:ss");

    const imdbRatingElement = $('p:contains("IMDb Rating:")');
    const imdbRating = imdbRatingElement
      .find("span")
      .text()
      .trim()
      .match(/\d+\.\d+/)?.[0];

    const shortTitle = getProperty(
      content,
      "Movie Name",
      "Series Name",
      "Full Name"
    );
    const language = getProperty(content, "Language");
    const quality = getProperty(content, "Quality");
    const season = getProperty(content, "Season");
    const episode = getProperty(content, "Episode");
    const subtitle = getProperty(content, "Subtitle", "Subtitles");
    const releasedYear = getProperty(content, "Released Year", "Release Year");
    const episodeSize = getProperty(content, "Episode Size", "Size");
    const completeZip = getProperty(content, "Complete Zip");
    const format = getProperty(content, "Format");

    const synopsisElement = content
      .find("h3, h4")
      .filter((_, element) => {
        const text = $(element).text().toLowerCase();
        return (
          text.includes("series synopsis/plot") ||
          text.includes("series-synopsis/plot") ||
          (!isSeason && text.includes("movie-synopsis/plot")) ||
          text.includes("movie synopsis/plot")
        );
      })
      .next("p");

    // const synopsis = synopsisElement.text().trim().replace(/\n/g, " ");
    const synopsis = synopsisElement.text().trim();

    const starringElement = content.find("p:contains('Starring')");
    const starring =
      starringElement
        .text()
        .match(/Starring\s*:\s*(.*)/i)?.[1]
        ?.trim() || null;

    // Define variations for creator information
    const creatorVariations = [
      "Created By",
      "Created And Directed By",
      "Directed By",
    ];
    const createdBy = extractCreatorInfo($, content, creatorVariations);

    // const createdByElement = content.find("p:contains('Created By')").first();
    // const createdBy =
    //     createdByElement
    //         .text()
    //         .match(/Created By\s*:\s*(.*)/i)?.[1]
    //         ?.trim() || null;

    const screenshots = scrapeScreenshots(content, $);

    const data = {
      title,
      featured_image: featureImage,
      description_1: description1,
      description_2: description2,
      sort_title: subheading,
      release_date: releaseDate,
      releaseDateText,
      imdb_rating: imdbRating || null,
      info_title: shortTitle,
      language,
      quality,
      season,
      episode,
      subtitle,
      released_year: releasedYear,
      episode_size: episodeSize,
      complete_zip: completeZip,
      format,
      synopsis,
      starring,
      movie_created_by: createdBy,
      screenshots,
      slug,
      is_season: isSeason,
    };

    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching movie details: " + error.message);
  }
};

module.exports = { fetchMovieDetails };

fetchMovieDetails(
  "https://m.vegamovies.photos/download-blue-beetle-2023-hindi-org-clear-english-480p-720p-1080p-hdcamrip/"
);
