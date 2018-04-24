import "../assets/styles/footer.styl"

export default{
    data(){
        return {
            author:'jack'
        }
    },
    render(){
        return(
            <div id="footer">
                <span>write to {this.author}</span>
            </div>
        )
    }
}