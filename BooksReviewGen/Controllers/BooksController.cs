using System;
using System.Globalization;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Bogus;

namespace BooksReviewGen.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private const int MaxPageSize = 50;
    private const int DefaultPageSize = 10;

    [HttpGet]
    public IActionResult GetBooks( [FromQuery] string region = "en", [FromQuery] int seed = 42,[FromQuery] int page = 0,
        [FromQuery] double likes = 0,
        [FromQuery] int reviews = 0)
    {
        try
        {
            if (!IsValidLocale(region))
            {
                return BadRequest("Invalid locale. Supported locales are: en, fr, es");
            }

            int pageSize = page == 0 ? 20 : DefaultPageSize;
            Randomizer.Seed = new Random(seed + page);
            var faker = new Faker(region);

            var bookFaker = new Faker<BookDto>(region)
                .RuleFor(b => b.Index, f => page * pageSize + f.IndexGlobal)
                .RuleFor(b => b.Isbn, f => f.Commerce.Ean13())
                .RuleFor(b => b.Title, f => f.Commerce.ProductName())
                .RuleFor(b => b.Authors, f => new[] { f.Name.FullName() })
                .RuleFor(b => b.Publisher, f => f.Company.CompanyName())
                .RuleFor(b => b.Likes, f => GenerateCount(likes))
                .RuleFor(b => b.ReviewCount, _ => reviews)
                .RuleFor(b => b.PublishedDate, f => f.Date.Past(10));

            var books = bookFaker.Generate(pageSize);
            return Ok(books);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while generating books");
        }
    }

    [HttpGet("{isbn}/reviews")]
    public IActionResult GetReviews(string isbn,[FromQuery] string region = "en",[FromQuery] int reviewsCount = 3)
    {
        try
        {
            if (!IsValidLocale(region))
            {
                return BadRequest("Invalid locale. Supported locales are: en, fr, es");
            }

            Randomizer.Seed = new Random(isbn.GetHashCode());
            var faker = new Faker(region);

            var reviewFaker = new Faker<ReviewDto>(region)
                .RuleFor(r => r.User, f => f.Name.FullName())
                .RuleFor(r => r.Text, f => GenerateReviewText(f, region));

            var reviews_res = reviewFaker.Generate(reviewsCount);
            return Ok(reviews_res);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while generating reviews");
        }
    }

    private static string GenerateReviewText(Faker faker, string locale)
    {
        var templates = locale switch
        {
            "fr" => new[]
            {
                $"J'adore ce livre! {faker.Lorem.Sentence()}",
                $"Excellent livre. Je le recommande! {faker.Lorem.Sentence()}",
                $"Pas mal, mais pourrait être amélioré. {faker.Lorem.Sentence()}"
            },
            "de" => new[]
            {
                $"Ich liebe dieses Buch! {faker.Lorem.Sentence()}",
                $"Hervorragendes Buch. Sehr empfehlenswert! {faker.Lorem.Sentence()}",
                $"Nicht schlecht, könnte aber verbessert werden. {faker.Lorem.Sentence()}"
            },
            _ => new[]
            {
                $"I absolutely love this book! {faker.Lorem.Sentence()}",
                $"Excellent book. Highly recommended! {faker.Lorem.Sentence()}",
                $"It's decent but could be improved. {faker.Lorem.Sentence()}"
            }
        };

        return faker.PickRandom(templates);
    }

    private static bool IsValidLocale(string locale)
    {
        return new[] { "en", "fr", "es" }.Contains(locale);
    }

    private static int GenerateCount(double avg)
    {
        int baseInt = (int)avg;
        double fractional = avg - baseInt;
        return baseInt + (Random.Shared.NextDouble() < fractional ? 1 : 0);
    }
}
