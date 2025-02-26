import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import { colors, spacingX, spacingY } from "@/constants/theme";
import BackButton from "@/components/BackButton";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";
import Button from "@/components/Button";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/authContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //const emailRef = useRef("");
  //const passwordRef = useRef("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login: loginUser } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Login", "Please enter all the fields");
      return;
    }

    setIsLoading(true);
    const res = await loginUser(email, password);
    setIsLoading(false);

    if (!res.success) {
      Alert.alert("Login Failed", res.msg);
    } else {
      router.replace("/(tabs)"); // ✅ Redirects to home after successful login
    }
  };

  return (
    <View style={styles.container}>
      <BackButton iconSize={28} />

      <View style={{ marginTop: spacingY._20, gap: 5 }}>
        <Typo size={30} fontWeight={"800"}>
          Hey,
        </Typo>
        <Typo size={30} fontWeight={"800"}>
          Welcome Back
        </Typo>
      </View>

      {/* form */}

      <View style={styles.form}>
        <Typo size={16} color={colors.textLighter}>
          Login now to track all your expenses
        </Typo>
        <Input
          placeholder="Enter your email"
          onChangeText={setEmail}
          icon={
            <Icons.At
              size={verticalScale(26)}
              color={colors.neutral300}
              weight="fill"
            />
          }
        />
        <Input
          placeholder="Enter your password"
          secureTextEntry
          onChangeText={setPassword}
          icon={
            <Icons.Lock
              size={verticalScale(26)}
              color={colors.neutral300}
              weight="fill"
            />
          }
        />
        <Typo size={14} color={colors.text} style={{ alignSelf: "flex-end" }}>
          Forgot Password?
        </Typo>

        <Button loading={isLoading} onPress={handleSubmit}>
          <Typo fontWeight={"700"} color={colors.black} size={21}>
            Login
          </Typo>
        </Button>
      </View>

      <View style={styles.footer}>
        <Typo size={15}>Don't have an account?</Typo>
        <Pressable onPress={() => router.navigate("/(auth)/register")}>
          <Typo size={15} fontWeight={"700"} color={colors.primary}>
            Sign up
          </Typo>
        </Pressable>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
    marginTop: spacingY._10,
  },
  welcomeText: {
    // fontSize: verticalScale(20),
    // fontWeight: "bold",
    // color: colors.text,
  },
  form: {
    gap: spacingY._20,
  },
  forgotPassword: {
    // textAlign: "right",
    // fontWeight: "500",
    // color: colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    // textAlign: "center",
    // color: colors.text,
    // fontSize: verticalScale(15),
  },
});
