#version 330 core

layout(location = 0) in vec3 positionAttrib;	// Shared attribute - make sure it's in location 0
in vec2 texCoordAttrib;
in vec3 normalAttrib;

out vec2 TexCoordPassed;
out vec3 NormalPassed;
out vec3 FragPosPassed;

uniform mat4 projection;
uniform mat4 modelView;
uniform mat3 textureMat;

void main()
{
	TexCoordPassed = vec2(textureMat * vec3(texCoordAttrib, 1.0f));
	gl_Position = projection * modelView * vec4(positionAttrib, 1.0f);
	NormalPassed = normalize(mat3(modelView) * normalAttrib);
	FragPosPassed = vec3(modelView * vec4(positionAttrib, 1.0f));
}
