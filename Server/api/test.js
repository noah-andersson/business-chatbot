const { catalogCities } = require("./petition");

const fetch = async () => {
  try {
    const res = await catalogCities();
    console.log(res.data);
  } catch (e) {
    console.log(e);
  }
};

fetch();
