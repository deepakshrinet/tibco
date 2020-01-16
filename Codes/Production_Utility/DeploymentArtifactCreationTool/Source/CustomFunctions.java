import java.text.ParseException;

public class CustomFunctions {
    public static String stringReplace(String string, String string2, String string3) {
        String string4 = string;
        String string5 = string.replaceAll(string2, string3);
        return string5;
    }

}