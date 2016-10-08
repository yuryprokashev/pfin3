/**
 * Created by py on 27/08/16.
 */

const MyDates = require('../../common/MyDates');

// End-2-End Test Suite
// I will define tests for user scenarios here.
describe('Pfin App', function() {

    var width = 1280;
    var height = 720;
    browser.driver.manage().window().setSize(width, height);

    function findCal() {
        // var result = element.all(by.css(".row")).get(1)
        //     .element(by.css(".col-md-10"))
        //     .element(by.tagName("calendar"));
        var result = element(by.tagName("calendar"));
        return result;
    }

    function findWeek(weeknum) {
        var c = findCal();
        return c.element(by.repeater("w in self.weeks").row(weeknum))
            .element(by.tagName("week"))
    }

    function findDay(weeknum, daycell, daycellnum) {
        var w = findWeek(weeknum);
        return w.element(by.tagName("div"))
            .element(by.repeater("c in self.html.days").row(daycell))
            .element(by.repeater("d in c").row(daycellnum))
            .element(by.tagName("day"))
            .element(by.css(".panel"))
            .element(by.css(".panel-body"));
            // .element(by.tagName("p"));
    }

    function findItem(weeknum, daycell, daycellnum, itemnum) {
        var d = findDay(weeknum, daycell, daycellnum);
        return d.element(by.css(".list-group"))
            .element(by.repeater("e in self.html.shownItems").row(itemnum))
            .element(by.tagName("item"))
            .element(by.tagName("p"));
    }

    function findForm() {
        var result = element.all(by.css(".row")).get(1)
            .element(by.css(".col-md-12"))
            .element(by.tagName("message-form"));
        return result;
    }

    function findFormField(fieldName) {
        var result = findForm()
            .element(by.name(fieldName));
        return result;
    }

    function findBtn(btnClass) {
        var result = findForm().
            element(by.css(btnClass));
        return result;
    }

    function sleepCallback () {
        browser.driver.sleep(1000);
    }


    // SCENARIO 1 -> User updates item in UI, click 'Save' and sees changes are being applied
    // - What happens:
    // -- User updates the Expense item in certain Day via UI and clicks 'Save'.
    // Say, User changed both 'item.amount' and 'item.description'.
    // -- Client.AppView sets 'item.isItemProcessing' for item, that has been updated, to TRUE.
    describe('SCENARIO 1 -> User updates item in UI, click "Save" and sees changes are being applied.', function () {
        var testItem;

        beforeEach(function () {
            testItem = {
                amount: Math.floor(Math.random() * 10000),
                description: `test expense at ${MyDates.now()} or ${new Date().toUTCString()}`
            };
            // open browser and log-in
            browser.driver.get("http://localhost:3000/auth/google");
            browser.driver.findElement(by.css("#Email")).sendKeys("yury.prokashev@gmail.com");
            browser.driver.findElement(by.css("#next")).click();
            browser.driver.sleep(1000);
            browser.driver.findElement(by.css("#Passwd")).sendKeys("Ypr0ka#ev01");
            browser.driver.findElement(by.css("#signIn")).click();
            browser.driver.sleep(3000);
            browser.driver.findElement(by.css("#submit_approve_access")).click();
            browser.driver.sleep(2000);
        });

        it('user sees that updated item is not synced -> item has class "is-not-syned" in its class attribute', function () {

            browser.get('http://localhost:3000/#/log-and-plan');

            // THIS WAS AUGUST 2016
            // findDay(0, 0, 1).click(); // -> click to 1st Day of 0th Week
            // findItem(0, 0, 1, 0).click(); // -> click on 1st item in clicked Day
            // findFormField("amount").clear().sendKeys(testItem.amount); // -> change amount
            // findFormField("description").clear().sendKeys(testItem.description); //-> change value
            // findBtn(".btn-success").click();
            // findItem(0, 0, 1, 0).getAttribute("class").then(function (item) {
            //     expect(item.search("is-not-synced")).not.toBe(-1);
            // });

            // THIS IS SEPTEMBER 2016
            findDay(1, 0, 1).click(); // -> click to 1st Day of 0th Week
            findItem(1, 0, 1, 0).click(); // -> click on 1st item in clicked Day
            findFormField("amount").clear().sendKeys(testItem.amount); // -> change amount
            findFormField("description").clear().sendKeys(testItem.description); //-> change value
            findBtn(".btn-success").click();
            findItem(1, 0, 1, 0).getAttribute("class").then(function (item) {
                expect(item.search("is-not-synced")).not.toBe(-1);
            });
        });
    });
});


// SCENARIO 2 -> User sees changes has been applied successfully.
// - What happens:
// -- Client.AppView sends a Message via MessagePoster - HTTP POST to /api/v1/message/:timeWindow.
// -- Pfin.api receives a Message and saves in to Message Model.
// -- Pfin.api sends 'message-new' thru Bus (based on Kafka Adapter)
// -- PayloadService gets the 'message-new', extracts payload and save it Payload Model.
// -- PaylodaService sends 'payload-new' thru Bus (based on KafkaAdapter)
// -- Pfin.PusherServer (based on socket.io) gets the 'payload-new' and send push to Client.AppView.PusherClient.
// -- Client.AppView.PusherClient listens to 'payload-new' and invokes change of 'Shared' variable, which causes Client.AppView.update to run.
// -- Client.AppView.update changes the 'item.isAwaitingAsyncPush' to FALSE.

// SCENARIO 3 -> User sees changes has been failed to POST.
// - What happens:
// -- Client.AppView sends a Message via MessagePoster - HTTP POST to /api/v1/message/:timeWindow.
// -- Pfin.api replied with Error.
// -- Client.AppView renders the Error to User
// -- Client.AppView allows to resend the Message.
// -- User clicks 'Save' -> goto SCENARIO 1.