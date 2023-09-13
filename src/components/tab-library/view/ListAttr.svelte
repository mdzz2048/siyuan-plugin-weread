<script lang="ts">
    import { book } from "..";

    export let books: book[] = [];
    export let book_keys = ['title'];
    
    books = [
        {
            bookId: '', 
            title: '测试1', 
            cover: ''
        }, 
        {
            bookId: '', 
            title: '测试2', 
            cover: ''
        }, 
        {
            bookId: '', 
            title: '测试3', 
            cover: ''
        }, 
        {
            bookId: '', 
            title: '测试4', 
            cover: ''
        }, 
        {
            bookId: '', 
            title: '测试5', 
            cover: ''
        }
	];
    books.map((book) => {
        let book_dict = {};
        for (let key in Object.keys(book)) {
            if (!book_keys.includes(key)) {
                book_dict[key] = book[key];
            }
        }
        return book_dict;
    })

</script>

<div style="display: flex;">
    {#each books as book}
        {#each Object.keys(book) as book_key}
            <div>
                {book[book_key]}
            </div>
        {/each}
    {/each}
</div>