#version 330 core

uniform vec3 colour;

out vec4 outputColour;

void main()
{
	outputColour = vec4(colour, 1.0);
}
