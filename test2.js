const axios = require("axios");
const cheerio = require("cheerio");

// Function to add "https://" before URLs that start with "//"
function addHttps(url) {
    if (url.startsWith("//")) {
        return `https:${url}`;
    }
    return url;
}

const fetchHTML = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error("Error fetching HTML: " + error.message);
    }
};

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

// URL to scrape
const url = "https://vegamovies.im/download-breaking-bad-season-2-complete-hindi-dubbed-org-480p-720p-1080p-web-dl/";
// Call the function and log the result
const fetchMovieDetails = async (url) => {
    try {
        const html = await fetchHTML(url);
        const $ = cheerio.load(html);

        const featured_image = extractAndFormatImageUrls($)
        console.log(featured_image);
        return featured_image;
    } catch (error) {
        console.error(error);
        throw new Error("Error fetching movie details: " + error.message);
    }
}

fetchMovieDetails(url)