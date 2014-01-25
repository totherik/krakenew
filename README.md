#### Data provider proof of concept.
This PoC demonstrates 2 types of providers:
- View Providers which map requested views to alternate views based on context.
- Data Providers which load data for one specific partial and render the partial using the newly provided context.


To test, start the server. Then hit each of the following URLs to test the provider scenarios.

http://localhost:8000 - Uses a provider registered for both `index` and `partial`. When the `index` dataprovider is
triggered it add it's own data to the rendering context. Subsequently, since there is a data provider registered for
`partial`, it does the same. The partial without a provider merely uses the existing context.

http://localhost:8000?alt=cell1 - Based on request context, and alternate dust template is chosen and rendered. In this case
`index_cell1` is used in lieu of `index` based in the implemented viewProvider. The same occurs for `partial` and `partial_cell1`.
Try removing the `partial` view resolver to see what happens.


http://localhost:8000?alt=cell5 - No providers match this value, so behavior falls back to the original.