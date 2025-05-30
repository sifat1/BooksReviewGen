using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using Bogus;

namespace BooksReviewGen.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    [HttpGet]
    public IActionResult GetBooks([FromQuery] string locale = "en",
        [FromQuery] int seed = 42, [FromQuery] int page = 0, 
        [FromQuery] double likes = 0, [FromQuery] double reviews = 0)
    {
        var rngSeed = seed + page;
        Randomizer.Seed = new Random(rngSeed);

        var culture = new CultureInfo(locale);
        var faker = new Faker(locale);

        var books = Enumerable.Range(1, page == 0 ? 20 : 10).Select(i => new
        {
            index = page * 10 + i,
            isbn = faker.Commerce.Ean13(),
            title = faker.Commerce.ProductName(),
            author = faker.Name.FullName(),
            publisher = faker.Company.CompanyName(),
            likes = GenerateCount(likes),
            reviews = GenerateCount(reviews)
        });

        return Ok(books);
    }

    private static int GenerateCount(double avg)
    {
        var baseInt = (int)avg;
        var fractional = avg - baseInt;
        return baseInt + (Random.Shared.NextDouble() < fractional ? 1 : 0);
    }
}
