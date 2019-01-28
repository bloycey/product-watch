const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

// Functions go here;

const jsonPriceRegex = /("price":|'price':)[0-9\."', ]+/gm;

const getBaseUrl = url => {
  let newUrl = new URL(url);
  return newUrl.protocol + newUrl.hostname;
};

const sanitizeArray = array => {
  // Remove null values
  let filtered = array.filter(value => {
    return value != null && value != "" && value != NaN;
  });

  // Remove blank spaces
  let trimmed = filtered.map(value => {
    return value.trim();
  });

  // Remove dollar signs
  let dollarSignRemoved = trimmed.map(value => {
    return value.replace("$", "");
  });

  let removeEmpty = dollarSignRemoved.filter(value => {
    return value != "";
  });

  //TODO: Remove letters

  return removeEmpty;
};

//Scraping Methods

const scrapeJson = (source, regex, priceIndex = 9999) => {
  let jsonFinal = [];
  const jsonRaw = source.match(regex) || [];
  if (jsonRaw.length > 0) {
    Object.values(jsonRaw).map(value => {
      //Remove everything except for floating point numbers
      jsonFinal.push(value.replace(/[^\d.-]/g, ""));
    });
  }
  if (priceIndex == 9999) {
    return sanitizeArray(jsonFinal);
  } else {
    let sanitizedArray = sanitizeArray(jsonFinal);
    return sanitizedArray[priceIndex];
  }
};

const scrapeMeta = (selector, priceIndex = 9999) => {
  console.log("scraping Meta");
  const metapricelength = selector.length;
  let metaFinal = [];
  if (metapricelength > 0) {
    // LOOP HERE AND PUSH PRICES TO ARRAY
    for (let i = 0; i < metapricelength; i++) {
      metaFinal.push(selector[i].attribs.content);
    }
  }
  if (priceIndex == 9999) {
    return sanitizeArray(metaFinal);
  } else {
    let sanitizedArray = sanitizeArray(metaFinal);
    return sanitizedArray[priceIndex];
  }
};

const scrapeItemprop = (selector, priceIndex = 9999) => {
  console.log("scraping Itemprop");
  const itemproplength = selector.length;
  console.log("itemproplength " + itemproplength);
  let itempropArray = [];
  if (itemproplength > 0) {
    for (let i = 0; i < itemproplength; i++) {
      //First look for the content attribute
      if (selector[i].attribs.content) {
        itempropArray.push(selector[i].attribs.content);
      }
      // Then look for the price directly within the itemprop tag;
      if (selector[i].children[0] !== undefined) {
        itempropArray.push(selector[i].children[0].data);
      }
      //Next Look for a span within the itemprop (this is a common pattern);
      if (
        selector[i].children[0] !== undefined &&
        selector[i].children[0].next !== null
      ) {
        if (selector[i].children[0].next.name == "span") {
          itempropArray.push(selector[i].children[0].next.children[0].data);
        }
      }
    }
  }
  if (priceIndex == 9999) {
    return sanitizeArray(itempropArray);
  } else {
    let sanitizedArray = sanitizeArray(itempropArray);
    return sanitizedArray[priceIndex];
  }
};

const scrapeGenericMeta = (selector, priceIndex = 9999) => {
  console.log("scraping generic meta");
  const genericMetaLength = selector.length;
  let genericMetaRaw = [];
  if (genericMetaLength > 0) {
    // LOOP HERE AND PUSH PRICES TO ARRAY
    for (let i = 0; i < genericMetaLength; i++) {
      genericMetaRaw.push(selector[i].attribs.content);
    }
  }
  if (priceIndex == 9999) {
    return sanitizeArray(genericMetaRaw);
  } else {
    let sanitizedArray = sanitizeArray(genericMetaRaw);
    return sanitizedArray[priceIndex];
  }
};

const scrapeDescription = selector => {
  console.log("scraping description");
  const descriptionLength = selector.length;
  let descriptionRaw = ["No Description Found"];
  if (descriptionLength > 0) {
    // Only push first item (lets hope its the right one)
    for (let i = 0; i < 1; i++) {
      descriptionRaw[0] = selector[i].attribs.content;
    }
  }
  return descriptionRaw[0];
};

const scrapeImage = (baseurl, selector) => {
  console.log("scraping image");
  const imageLength = selector.length;
  let imagePath = ["No Image Found"];
  if (imageLength > 0) {
    // Only push first item (lets hope its the right one)
    for (let i = 0; i < 1; i++) {
      imagePath[0] = selector[i].attribs.content;
    }
  }

  // If not image found
  if (imagePath[0] == "No Image Found") {
    return "No Image Found";
  }
  //If the url has www or http in it then the image path is probably absolute
  if (imagePath[0].search("www") !== -1 || imagePath[0].search("http") !== -1) {
    return imagePath[0];
  } else {
    // handle relative image url path
    return baseurl + imagePath[0];
  }
};

//END SCRAPING METHODS

// @route   GET api/getPrice
// @desc    Gets usernames from github API based on search
// @access  Public

//Route for getting search results

router.get("/:name", (req, res) => {
  //   console.log(req);
  //   console.log("Product Name is " + req.params.name, req.query.url);
  const name = req.params.name;
  const url = req.query.url;
  const baseUrl = getBaseUrl(url);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  };
  const dateRaw = new Date().getTime();
  const date = new Date().toLocaleString("en-AU", options);
  let prices,
    jsonld,
    jsonldlength,
    metalength,
    itemproplength,
    itempropSelector,
    genericMeta,
    genericMetaLength,
    metaprice,
    itemprop,
    all,
    pricesString,
    status;

  axios
    .get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
      }
    })
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      status = response.status;

      jsonld = [];
      metaprice = [];
      itemprop = [];
      genericMeta = [];

      // 1.1 JSONLD
      jsonld = scrapeJson(html, jsonPriceRegex);

      // 1.2 Meta Price (using the facebook meta recommendations)
      metaprice = scrapeMeta($("meta[property='product:price:amount']"));

      // 1.3 Itemprop Price
      itemprop = scrapeItemprop($("[itemprop='price']"));

      // 1.4 Generic Meta
      genericMeta = scrapeGenericMeta($("meta[property='price']"));

      //1.5 Description
      const description = scrapeDescription($("meta[name='description']"));

      //1.6 Image
      const image = scrapeImage(baseUrl, $("meta[property='og:image']"));

      const productObject = {
        productName: name,
        description,
        url,
        image,
        baseUrl,
        dateAdded: date,
        dateAddedRaw: dateRaw,
        date,
        jsonld,
        metaprice,
        itemprop,
        genericMeta,
        price: "",
        shippingPrice: "0.00",
        totalPrice: "0",
        type: "",
        priceIndex: "",
        editMode: true,
        status,
        updating: false,
        movement: {
          trend: "No Movement Detected"
        }
      };
      //   console.log("product Object", productObject);
      res.send({
        response: productObject
      });
    })
    .catch(error => {
      //   console.log(error);
      res.send({
        status: "error",
        msg: response
      });
    });
});

module.exports = router;
