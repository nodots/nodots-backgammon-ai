#version 330 core

in vec2 TexCoordPassed;
in vec3 FragPosPassed;
in vec3 NormalPassed;

out vec4 colour;

// Light values
struct Light {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
	int specModel;
	bool dirLight;

	vec3 lightDirection;
	vec3 lightPos;
	vec3 viewPos;
};

uniform sampler2D materialDiffuse;

uniform Light light;

// Todo - take a look at specular effects
float CalcSpecular(vec3 normal, vec3 viewDir, vec3 lightDir)
{
	if (light.specModel == 1)	// Phong specular
	{
		vec3 reflectDir = reflect(-lightDir, normal);
		float phongTerm = dot(viewDir, reflectDir);
		phongTerm = max(phongTerm, 0.0);
		return pow(phongTerm, light.shininess);
	}
	else if (light.specModel == 2)	// Blinn specular
	{
		vec3 halfAngle = normalize(lightDir + viewDir);
		float blinnTerm = dot(normal, halfAngle);
		blinnTerm = max(blinnTerm, 0.0f);
		return pow(blinnTerm, light.shininess * 2);	// '* 2' approx same as phong
	}
	else //if (light.specModel == 3)	// Gaussian specular
	{
		vec3 halfAngle = normalize(lightDir + viewDir);
		float angleNormalHalf = acos(dot(halfAngle, normal));
		float exponent = angleNormalHalf / (light.shininess / 100.0f);	// '/ 100' approx same as phong
		float gaussianTerm = exp(-(exponent * exponent));
		return gaussianTerm;
	}
}

void main()
{
	vec3 viewDir = normalize(light.viewPos - FragPosPassed);
	vec3 normal = normalize(NormalPassed);
	vec3 dirToLight = normalize(-light.lightDirection);

	float diffuse = 0.0f;
	float specular = 0.0f;

	if (light.dirLight)
	{
		diffuse = max(dot(normal, dirToLight), 0.0f);
		specular += CalcSpecular(normal, viewDir, dirToLight);
	}
	else	// Point light
	{
		vec3 viewDirPoint = normalize(light.lightPos - FragPosPassed);
		diffuse = max(dot(normal, viewDirPoint), 0.0f);
		specular += CalcSpecular(normal, viewDir, viewDirPoint);
	}

	vec4 matVal = texture(materialDiffuse, TexCoordPassed);

	vec3 totColour = vec3(0.0f);
	totColour += light.ambient * vec3(matVal) * 0.75f;

	totColour += light.diffuse * diffuse * vec3(matVal) * 0.75f;

	if (light.shininess > 0)
	{
		vec3 specularVec = light.specular * specular;
		totColour += specularVec;
	}

	colour = vec4(min(totColour, vec3(1.0f, 1.0f, 1.0f)), matVal.a);	// .a for alpha blending
}
