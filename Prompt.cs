public class Prompt
{
  public string Id { get; set; }
  public string? PromptText { get; set; }
  public Prompt(string id, string Text)
  {
    Id = id;
    PromptText = Text;
  }
}