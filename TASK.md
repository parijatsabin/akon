Analyze the current Business Hours implementation and update it to follow the UI structure below.

UI Layout:

* Section Title: **Business Hours**
* Header Controls:

  * **Default Time** checkbox/toggle
  * When enabled, apply **09:00 AM – 05:00 PM** as the default time for all active days.
* Display all 7 days in a table format.

Table Columns:

| Day | From | To | Is Closed |
| --- | ---- | -- | --------- |

Rows:

* Sunday
* Monday
* Tuesday
* Wednesday
* Thursday
* Friday
* Saturday

Functionality:

* Each day must have its own:

  * Opening Time (From)
  * Closing Time (To)
  * Is Closed checkbox
* If **Is Closed** is checked:

  * Disable From and To fields.
  * Store the day as closed.
  * Display "Closed" on the website.
* If **Default Time** is enabled:

  * Automatically populate 09:00 AM – 05:00 PM for open days.
  * Admin can still disable specific days using Is Closed.
* Data must be fully manageable from the Admin CMS and reflected dynamically on the website.

Implementation Notes:

* Review existing models, APIs, database schema, CMS forms, and website components.
* Reuse existing structures where possible.
* Keep the UI clean, responsive, and easy to manage.
* Update only the Business Hours feature; do not modify other sections.
