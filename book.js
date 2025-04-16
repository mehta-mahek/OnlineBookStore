document.addEventListener("DOMContentLoaded", function () {
    fetch("http://localhost:3000/api/books") // Adjust port if different
        .then(response => response.json())
        .then(data => {
            let booksContainer = document.getElementById("books-list");
            booksContainer.innerHTML = "";
            data.forEach(book => {
                let bookItem = `
                    <div class="book">
                        <img src="${book.image_url}" alt="${book.title}">
                        <h3>${book.title}</h3>
                        <p>Price: ₹${book.price}</p>
                    </div>`;
                booksContainer.innerHTML += bookItem;
            });
        })
        .catch(error => console.error("Error fetching books:", error));
});
