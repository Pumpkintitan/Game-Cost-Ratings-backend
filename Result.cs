public class Result
{
  public string Id { get; set; }
  public string? PromptText { get; set; }
  public List<double>? Prices { get; set; }
  public Result(string id, string Text, List<double> Data)
  {
    Id = id;
    PromptText = Text;
    Prices = Data;
  }
}