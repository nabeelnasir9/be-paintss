const convertDimensions = (dimensions) => {
  if (dimensions === "8:11") {
    return "Small";
  }
  if (dimensions === "15:19") {
    return "Medium";
  }
  if (dimensions === "1:2") {
    return "Large";
  }
};

module.exports = convertDimensions;
