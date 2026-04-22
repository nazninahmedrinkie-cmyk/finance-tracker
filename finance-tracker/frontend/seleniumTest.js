const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function testFinTrack() {
  let service = new chrome.ServiceBuilder('./chromedriver.exe');
  
  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeService(service)
    .build();

  try {
    // Open your app
    await driver.get('http://localhost:3000');

    // Wait for page load
    await driver.sleep(2000);

    console.log("App opened successfully");

  } catch (err) {
    console.log("Error:", err);
  } finally {
    await driver.quit();
  }
})();