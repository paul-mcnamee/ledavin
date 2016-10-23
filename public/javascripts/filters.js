var $filterCheckboxes = $('input[type="checkbox"]');

$filterCheckboxes.on('change', function() {

    var selectedFilters = {};

    //find the selected checkboxes
    $filterCheckboxes.filter(':checked').each(function() {

        if (!selectedFilters.hasOwnProperty(this.name)) {
            selectedFilters[this.name] = [];
        }

        //collect the values of the checkboxes to filter on
        selectedFilters[this.name].push(this.value);
    });

    // create a collection containing all of the filterable elements
    var $filteredResults = $('.product');

    // loop over the selected filter name -> (array) values pairs
    $.each(selectedFilters, function(name, filterValues) {

        // filter each .product element
        $filteredResults = $filteredResults.filter(function() {

            var matched = false,
                currentFilterValues = $(this).data('category').split(' ');

            // loop over each category value in the current .product's data-category
            $.each(currentFilterValues, function(_, currentFilterValue) {

                // if the current category exists in the selected filters array
                // set matched to true, and stop looping. as we're ORing in each
                // set of filters, we only need to match once

                if ($.inArray(currentFilterValue, filterValues) != -1) {
                    matched = true;
                    return false;
                }
            });

            // if matched is true the current .product element is returned
            return matched;

        });
    });

    $('.product').hide().filter($filteredResults).fadeIn(500);

});
