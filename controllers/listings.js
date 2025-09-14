const Listing = require("../models/listing");
const { Client } = require("@googlemaps/google-maps-services-js");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = new Client({});



module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {

    res.render("listings/new.ejs");
};
module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        }).populate("owner");
    if (!listing) {
        req.flash("error", "listing you requested for, does not exist");
        return res.redirect("/listings");
    }
    
    res.render("listings/show.ejs", { listing ,mapToken});
};


module.exports.createListing = async (req, res) => {
  try {
    // Replace with dynamic location, e.g. req.body.listing.location
    const address = "New Delhi, India";

    const response = await geocodingClient.geocode({
      params: {
        address: address,
        key: mapToken,
      },
    });

    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;

    //   console.log("Latitude:", location.lat);
    //   console.log("Longitude:", location.lng);

      // Save listing with coordinates
      let url = req.file.path;
      let filename = req.file.filename;

      const newListing = new Listing(req.body.listing);
      newListing.owner = req.user._id;
      newListing.image = { url, filename };

      // store geometry from Google Maps
      newListing.geometry = {
        type: "Point",
        coordinates: [location.lng, location.lat],
      };

      let savedlisting =await newListing.save();
      console.log(savedlisting);

      req.flash("success", "new listing created!");
      res.redirect("/listings");
    } else {
      console.error("Geocode failed:", response.data.status);
      res.status(500).send("Failed to geocode address");
    }
  } catch (err) {
    console.error(
      "Geocoding error:",
      err.response ? err.response.data : err.message
    );
    res.status(500).send("Failed to fetch location");
  }
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "listing does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl =listing.image.url;
    originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "listing updated");
    res.redirect(`/listings/${id}`);  // Fixed space in URL
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        throw new ExpressError(404, "Listing not found");
    }
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};