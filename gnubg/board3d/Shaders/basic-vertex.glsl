#version 330 core

layout(location = 0) in vec3 positionAttrib;	// Shared attribute - make sure it's in location 0

uniform mat4 projection;
uniform mat4 modelView;

void main()
{
	gl_Position = projection * modelView * vec4(positionAttrib, 1.0f);
}
