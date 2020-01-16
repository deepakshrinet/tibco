package com.zimmer.eai.tibcobw; 
import java.util.UUID;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.io.*;


public class CustomFunctions{      
	/**      
	* This function will replace all replaceValues with repkaceWith values in inputString.      
	*/
    public static String stringReplace(String inputString, String replaceValue, String replaceWith){         
		String str = inputString;
		String output = inputString.replaceAll(replaceValue, replaceWith);
		return output;
	} 
	public static String genUUID(){
		UUID uuid = UUID.randomUUID();
		return uuid.toString();
	}
	

	public static String julianToGeorgianDate(String input)  {
        
            String julianDate = input;
            julianDate = julianDate.substring(1,6);
            String julianDate1="20";
            julianDate=julianDate1.concat(julianDate);
            DateFormat fmt1 = new SimpleDateFormat("yyyyDDD"); 
            DateFormat fmt2 = new SimpleDateFormat("yyyy-MM-dd");  
			String georgianDate= null;

		try
		{
             georgianDate = fmt2.format(fmt1.parse(julianDate));  
		}	
		catch(ParseException e)
		{
		// Handle Exception, take a look at e.ErrorOffset to know where the problem occurs
		// if the Message doesnt give enough information
		} 
 
		return georgianDate ;
    }


} 