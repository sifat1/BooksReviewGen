public class BookDto
{
    public int Index { get; set; }
    public string Isbn { get; set; }
    public string Title { get; set; }
    public string[] Authors { get; set; }
    public string Publisher { get; set; }
    public int Likes { get; set; }
    public int ReviewCount { get; set; }
    public DateTime PublishedDate { get; set; }
}