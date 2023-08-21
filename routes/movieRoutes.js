const express = require("express");
const router = express.Router();
const { fetchMovieDetails } = require("../movieScraper");
const Movie = require("../models/Movie");
const FeaturedImage = require("../models/FeaturedImage");
const Screenshot = require("../models/Screenshot");
const ScreenshotsMovieLink = require("../models/ScreenshotsMovieLink");

// POST API to scrape movie details and store in the database
router.post("/api/scrape-movie", async (req, res) => {
    try {
        const { url, created_by_id } = req.body;
        const createdBy = created_by_id || 1; // Set default value to 1 if not provided

        // Fetch movie details from the provided URL using the fetchMovieDetails function
        const scrapedMovieDetails = await fetchMovieDetails(url);

        // Extract movie-related attributes and featured_image
        const {
            title,
            release_date,
            info_title,
            starring,
            movie_created_by,
            screenshots,
            featured_image,
            ...otherAttributes
        } = scrapedMovieDetails;

        const existingMovie = await Movie.findOne({ where: { slug: otherAttributes.slug } });
        if (existingMovie) {
            return res.json({
                message: "Movie with the same slug already exists in the database.",
                movie: existingMovie,
            });
        }

        // Set starring and movie_created_by to null if they are empty strings
        const starringValue = starring === "" ? null : starring;
        const movieCreatedByValue =
            movie_created_by === "" ? null : movie_created_by;

        if (!screenshots || screenshots.length === 0) {
            return res.json({
                message: "Movie details scraped but no screenshots available.",
                movie: null,
            });
        }

        // Create or update movie based on movie-related attributes and createdBy
        const movie = await Movie.create({
            title,
            release_date,
            info_title,
            starring: starringValue,
            movie_created_by: movieCreatedByValue,
            created_by_id: createdBy,
            ...otherAttributes,
        });
        // Ensure that the main image URL is not null
        if (!featured_image || !featured_image.main) {
            console.log("featured_image:", featured_image); // Add this line to check the content of featured_image
            throw new Error("FeaturedImage.main cannot be null");
        }

        // Extract the common title for all FeaturedImage entries
        const commonTitle = `${info_title} - Featured Image`;

        const featuredImage = await FeaturedImage.create({
            title: commonTitle,
            main: featured_image.main,
            size_300_w: featured_image.size_300w || null,
            size_200_w: featured_image.size_200w || null,
            size_165_w: featured_image.size_165w || null,
            created_by_id: created_by_id || 1,
        });

        const featuredImages = [featuredImage];
        await movie.addFeaturedImage(featuredImages, {
            through: {
                // Set the featured_image_order
                featured_image_order: 1,
            },
        });

        // Add screenshots and link them to the movie
        if (screenshots && screenshots.length > 0) {
            const screenshotPromises = screenshots.map((screenshot, index) => {
                // Concatenate info_title and index with title in the Screenshot table
                const screenshotTitle = `${info_title} - ${index + 1}`;
                return Screenshot.create({ ...screenshot, title: screenshotTitle });
            });

            const createdScreenshots = await Promise.all(screenshotPromises);

            for (const [index, screenshot] of createdScreenshots.entries()) {
                await ScreenshotsMovieLink.create({
                    screenshot_id: screenshot.id,
                    movie_id: movie.id,
                    screenshot_order: index + 1,
                });
            }
        }

        const createdMovie = await Movie.findOne({
            where: { id: movie.id },
            include: [
                {
                    model: FeaturedImage,
                    through: { attributes: [] },
                },
                {
                    model: Screenshot,
                    through: { attributes: [] },
                },
            ],
        });

        res.json({
            message: "Movie details scraped and saved successfully!",
            createdMovie,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to scrape movie details." });
    }
});

// GET API to fetch all movies with their screenshots
router.get("/api/movies", async (req, res) => {
    try {
        // Find all movies in the database
        const movies = await Movie.findAll({
            include: [
                {
                    model: Screenshot,
                    through: { attributes: [] }, // Exclude the junction table attributes
                },
                {
                    model: FeaturedImage,
                    through: { attributes: [] }, // Exclude the junction table attributes
                },
            ],
        });

        res.json({
            message: "All movies fetched successfully!",
            movies,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch movies." });
    }
});

module.exports = router;