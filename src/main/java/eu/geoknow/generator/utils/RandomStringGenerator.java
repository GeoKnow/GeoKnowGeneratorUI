package eu.geoknow.generator.utils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class RandomStringGenerator {
    private static char[] chars = {
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            '+', '-', '_'
    };

    private static char[] lower = {
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    };

    private static char[] upper = {
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    };

    private static char[] digits = {
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    };

    public String generateSimple(int length) {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++)
            sb.append(chars[random.nextInt(chars.length)]);
        return sb.toString();
    }

    //at least one digit, one upper case and one lower case
    public String generateBasic(int length) {
        if (length < 3)
            throw new RuntimeException("Invalid basic password length (< 3)");

        List<Character> passwordChars = new ArrayList<>();

        Random randomLower = new Random();
        passwordChars.add(lower[randomLower.nextInt(lower.length)]);

        Random randomUpper = new Random();
        passwordChars.add(upper[randomUpper.nextInt(upper.length)]);

        Random randomDigit = new Random();
        passwordChars.add(digits[randomDigit.nextInt(digits.length)]);

        Random randomChars = new Random();
        for (int i = 0; i < length-3; i++)
            passwordChars.add(chars[randomChars.nextInt(chars.length)]);

        Collections.shuffle(passwordChars);

        StringBuilder passwordString = new StringBuilder();
        for (Character c : passwordChars)
            passwordString.append(c);
        return passwordString.toString();
    }
}
