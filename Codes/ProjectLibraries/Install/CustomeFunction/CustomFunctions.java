import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.UUID;
import java.util.regex.Pattern;

public class CustomFunctions
{
  public static String stringReplace(String paramString1, String paramString2, String paramString3)
  {
    
    String str1 = paramString1.replaceAll(Pattern.quote(paramString2), paramString3);
    return str1;
  }
  
  public static String genUUID()
  {
    UUID localUUID = UUID.randomUUID();
    return localUUID.toString();
  }
  
  public static String julianToGeorgianDate(String paramString)
  {
    String str1 = paramString;
    str1 = str1.substring(1, 6);
    String str2 = "20";
    str1 = str2.concat(str1);
    SimpleDateFormat localSimpleDateFormat1 = new SimpleDateFormat("yyyyDDD");
    SimpleDateFormat localSimpleDateFormat2 = new SimpleDateFormat("yyyy-MM-dd");
    String str3 = null;
    try
    {
      str3 = localSimpleDateFormat2.format(localSimpleDateFormat1.parse(str1));
    }
    catch (ParseException localParseException) {}
    return str3;
  }
  
  public static void main(String []args){
	  
  }
  
}
