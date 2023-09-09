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
// const scrapeScreenshots = (content, $) => {
//   const screenshots = [];
//   const screenshotHeadingsSelector = [
//     "h2:contains('Screenshots: (Must See Before Downloading)…')",
//     "h4:contains(': SCREENSHOTS :')",
//     "h2:contains('Screenshots: (Must See Before Downloading)')",
//   ].join(", ");

//   const screenshotHeadings = content.find(screenshotHeadingsSelector);
//   screenshotHeadings.each((_, heading) => {
//     const screenshotContainer = $(heading).next("p");
//     screenshotContainer.find("img").each((_, img) => {
//       const url = $(img).attr("src");
//       screenshots.push({ url });
//     });
//   });

//   return screenshots;
// };

const scrapeScreenshots = async ($, url) => {
  try {
    // Define possible heading selectors
    const screenshotHeadingsSelector = [
      "h2:contains('Screenshots: (Must See Before Downloading)…')",
      "h4:contains(': SCREENSHOTS :')",
      "h2:contains('Screenshots: (Must See Before Downloading)')",
    ].join(", ");

    // Find the first matching heading
    const screenshotHeading = $(screenshotHeadingsSelector).first();

    // Initialize an array to store the image URLs
    const screenshotUrls = [];

    // Check if the screenshotHeading was found
    if (screenshotHeading.length) {
      // Find all img tags within the parent p tag of the h2
      const screenshotImages = screenshotHeading.next("p").find("img");

      // Iterate over the images and extract their source URLs
      screenshotImages.each((_, img) => {
        const imgUrl = $(img).attr("data-lazy-src");
        if (imgUrl) {
          // Convert the relative URL to absolute URL
          const absoluteUrl = new URL(imgUrl, url).href;
          screenshotUrls.push(absoluteUrl);
        }
      });
    }

    return screenshotUrls;
  } catch (error) {
    throw new Error("Error scraping screenshots: " + error.message);
  }
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

function addHttps(url) {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
}

// Function to extract image URLs and format them with root URL
const extractAndFormatImageUrls = ($) => {
  try {
    // Find the noscript tag within the .single-feature-image div
    const noscriptTag = $(".single-feature-image noscript");

    // Extract the HTML content within the noscript tag
    const noscriptHtml = noscriptTag.html();

    // Create a new Cheerio instance for the content within the noscript tag
    const noscriptContent = cheerio.load(noscriptHtml);

    // Find the image element within the noscript content
    const imageElement = noscriptContent("img");

    // Extract the src attribute from the image element
    let main = imageElement.attr("src");

    // Extract the srcset attribute from the image element
    const srcset = imageElement.attr("srcset");

    // Split the srcset into individual URLs and sizes
    const srcsetUrls = srcset
      ? srcset.split(',').map(item => {
        const parts = item.trim().split(' ');
        return {
          url: parts[0],
          size: parts[1].replace(/[^\d]/g, ""), // Extract the size (e.g., "300w" -> "300")
        };
      })
      : [];

    // Add "https://" before URLs that start with "//"
    main = addHttps(main);
    const formattedSrcsetUrls = srcsetUrls.map(({ url, size }) => ({
      size: size + "w",
      url: addHttps(url),
    }));

    // Build the featureImage object
    const featureImage = {
      main: main || "",
    };

    // Create size_XXXw keys for each srcset URL
    formattedSrcsetUrls.forEach(({ size, url }) => {
      featureImage[`size_${size}`] = url || "";
    });

    return featureImage;
  } catch (error) {
    console.error("Error fetching URL:", error);
    return {};
  }
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
    const featureImage = await extractAndFormatImageUrls(
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

    const screenshots = scrapeScreenshots($, url);

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
  "https://vegamovies.im/download-breaking-bad-season-2-complete-hindi-dubbed-org-480p-720p-1080p-web-dl/"
);
