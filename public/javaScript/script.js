function addToCart(proId) {
    console.log("entered")
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            console.log(response);

            if (response.status) {
                let count = $('#cart-Count').html()
                count = parseInt(count) + 1
                swal("ADD TO CART", {
                    icon: "success",
                });
                $('#cart-Count').html(count)


            }

        }
    })
}
